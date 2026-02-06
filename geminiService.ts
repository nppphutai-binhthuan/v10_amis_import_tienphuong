
import { GoogleGenAI, Type } from "@google/genai";
import { GroupType, ImportItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      orderId: { type: Type.STRING, description: "Số đơn hàng" },
      customerName: { type: Type.STRING, description: "Tên khách hàng" },
      itemCode: { type: Type.STRING, description: "Mã hàng" },
      itemName: { type: Type.STRING, description: "Tên hàng trích xuất CHÍNH XÁC NGUYÊN VĂN từ nội dung văn bản trên phiếu. Không tự ý sửa đổi." },
      quantity: { type: Type.NUMBER, description: "Số lượng" },
      unit: { type: Type.STRING, description: "Đơn vị tính" },
      unitPrice: { type: Type.NUMBER, description: "Đơn giá (Trích xuất đúng giá trị trên phiếu, chấp nhận giá trị 0)" },
      amount: { type: Type.NUMBER, description: "Thành tiền trước KM (Chấp nhận giá trị 0)" },
      discountRate: { type: Type.NUMBER, description: "Tỷ lệ CK (%)" },
      discountAmount: { type: Type.NUMBER, description: "Tiền chiết khấu" },
      afterDiscountAmount: { type: Type.NUMBER, description: "Thành tiền sau KM (Chấp nhận giá trị 0 cho hàng tặng)" },
      totalPayment: { type: Type.NUMBER, description: "Tổng tiền thanh toán cuối đơn" },
    },
    required: ["orderId", "customerName", "itemCode", "itemName", "quantity", "unit", "unitPrice", "amount", "discountRate", "discountAmount", "afterDiscountAmount", "totalPayment"],
  }
};

export const processImportData = async (
  fileBase64: string,
  mimeType: string,
  group: GroupType
): Promise<ImportItem[]> => {
  const systemInstructions = `
    Bạn là "MISA AMIS IMPORT PRO" (V10.2) - Hệ thống ETL Siêu tốc & Chính xác tuyệt đối.
    Mật khẩu hệ thống: admin271235.
    
    NHIỆM VỤ: Trích xuất dữ liệu từ Phiếu Giao Hàng & Thanh Toán.
    
    CÁC QUY TẮC BẮT BUỘC (NẾU VI PHẠM SẼ LỖI HỆ THỐNG):
    1. HÀNG TẶNG/KM: Trích xuất 100% tất cả các dòng hàng có trên phiếu. Tuyệt đối KHÔNG bỏ sót các dòng có Đơn giá = 0 hoặc Hàng khuyến mại.
    2. TÊN HÀNG HÓA: Phải lấy CHÍNH XÁC NGUYÊN VĂN chuỗi ký tự hiển thị trên phiếu (Ví dụ: "DG PAL Duong Am 6gx880"). Tuyệt đối KHÔNG tự ý thay đổi, không sửa lỗi chính tả, không dịch sang tên đầy đủ.
    3. MÃ HÀNG: Trích xuất đầy đủ mã số/ký hiệu đi kèm sản phẩm.
    
    LOGIC TỐI ƯU CHO ${group}:
    - UNICHARM: Tách số dính (ví dụ "10gói" -> 10 và gói). Xử lý hàng tặng Unicharm thường nằm ở cuối danh mục.
    - KIDO: Lấy mã trong [xxxx]. Giữ nguyên tên viết tắt của Kido.
    - COLGATE: Lấy đầy đủ các mã CP (Promotion) có đơn giá 0.
    - KIOTVIET_NPP: Xóa hậu tố _TH/-TH ở mã hàng nhưng giữ nguyên Tên hàng hóa.

    YÊU CẦU PHẢN HỒI: Chỉ trả về JSON ARRAY. Không giải thích. Tốc độ cực nhanh.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: fileBase64, mimeType: mimeType } },
          { text: `Trích xuất TOÀN BỘ dòng hàng từ phiếu ${group}. Giữ nguyên Tên hàng nguyên văn. Không bỏ sót hàng đơn giá 0.` }
        ]
      }
    ],
    config: {
      systemInstruction: systemInstructions,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Hệ thống AI không phản hồi.");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Lỗi cấu trúc dữ liệu trích xuất.");
  }
};
