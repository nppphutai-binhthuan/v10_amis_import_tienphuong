
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
      itemName: { type: Type.STRING, description: "Tên hàng trích xuất CHÍNH XÁC NGUYÊN VĂN từ nội dung văn bản trên phiếu. Bao gồm cả các hậu tố hoặc tiền tố như VIPSHOP, ONTOP, Trả Thưởng, Trưng Bày nếu có." },
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
    Bạn là "MISA AMIS IMPORT PRO" (V10.3) - Chuyên gia trích xuất dữ liệu ETL đa nền tảng.
    Mật khẩu hệ thống: admin271235.
    
    NHIỆM VỤ: Trích xuất dữ liệu từ Phiếu Giao Hàng & Thanh Toán cho các nhóm [KIDO, Unicharm, Colgate, KIOTVIET].
    
    YÊU CẦU ĐẶC BIỆT V10.3:
    1. XỬ LÝ HẠNG MỤC RIÊNG: Các nội dung chứa từ khóa "VIPSHOP", "ONTOP", "Trả Thưởng", "Trưng Bày" phải được trích xuất thành một dòng hàng/sản phẩm độc lập nếu chúng xuất hiện dưới dạng dòng hàng trên phiếu.
    2. ĐƠN GIÁ & THÀNH TIỀN: Phải trích xuất đầy đủ Đơn giá và Thành tiền cho các dòng này để phục vụ Misa Template. Không được bỏ qua ngay cả khi giá trị đặc biệt.
    3. NGUYÊN VĂN TÊN HÀNG: Giữ 100% nguyên văn chuỗi ký tự Tên hàng hóa từ OCR. Không tự ý sửa đổi, không bỏ bớt chữ.
    4. KHÔNG BỎ SÓT: Trích xuất mọi dòng hàng có Số lượng > 0, kể cả Đơn giá = 0.

    LOGIC NHÓM - ${group}:
    - KIDO: Lấy mã trong [xxxx].
    - UNICHARM: Tách số dính OCR (10thùng -> 10 và thùng).
    - COLGATE: Trích xuất mã CP khuyến mại.
    - KIOTVIET_NPP: Làm sạch mã hàng nhưng giữ nguyên Tên hàng hóa.

    YÊU CẦU PHẢN HỒI: Trả về JSON ARRAY. Không giải giải thích thêm.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: fileBase64, mimeType: mimeType } },
          { text: `Trích xuất phiếu ${group}. Đặc biệt lưu ý các dòng chứa VIPSHOP, ONTOP, Trả Thưởng, Trưng Bày. Giữ nguyên đơn giá.` }
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
  if (!text) throw new Error("Hệ thống AI không phản hồi dữ liệu.");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Lỗi cấu trúc JSON trích xuất từ AI.");
  }
};
