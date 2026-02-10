
import { GoogleGenAI, Type } from "@google/genai";
import { GroupType, ImportItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      orderId: { type: Type.STRING, description: "Số đơn hàng / Số phiếu giao hàng / Số HĐ trích xuất từ phiếu" },
      customerName: { type: Type.STRING, description: "Tên khách hàng" },
      salesPerson: { type: Type.STRING, description: "Tên nhân viên bán hàng hoặc người giao hàng (NVBH / NV)" },
      itemCode: { type: Type.STRING, description: "Mã hàng" },
      itemName: { type: Type.STRING, description: "Tên hàng trích xuất CHÍNH XÁC NGUYÊN VĂN từ nội dung văn bản trên phiếu (Ví dụ: DG PAL Duong Am). Không tự sửa đổi." },
      quantity: { type: Type.NUMBER, description: "Số lượng" },
      unit: { type: Type.STRING, description: "Đơn vị tính hiển thị trên phiếu" },
      unitPrice: { type: Type.NUMBER, description: "Đơn giá (Nếu là hàng tặng/KM thì đơn giá bằng 0)" },
      amount: { type: Type.NUMBER, description: "Thành tiền trước KM" },
      discountRate: { type: Type.NUMBER, description: "Tỷ lệ CK (%)" },
      discountAmount: { type: Type.NUMBER, description: "Tiền chiết khấu" },
      afterDiscountAmount: { type: Type.NUMBER, description: "Thành tiền sau KM (Thực tế thanh toán dòng hàng)" },
      totalPayment: { type: Type.NUMBER, description: "Tổng cộng tiền thanh toán của cả đơn hàng (Footer Total)" },
    },
    required: ["orderId", "customerName", "salesPerson", "itemCode", "itemName", "quantity", "unit", "unitPrice", "amount", "discountRate", "discountAmount", "afterDiscountAmount", "totalPayment"],
  }
};

export const processImportData = async (
  fileBase64: string,
  mimeType: string,
  group: GroupType
): Promise<ImportItem[]> => {
  const systemInstructions = `
    Bạn là "MISA AMIS IMPORT PRO" (V10.5) - Chuyên gia ETL trích xuất dữ liệu hóa đơn/phiếu giao hàng siêu cấp.
    Mật khẩu hệ thống: admin271235.
    
    NHIỆM VỤ CHIẾN LƯỢC V10.5 (ĐỒNG BỘ LOGIC COLGATE):
    1. TRÍCH XUẤT NHÂN VIÊN: Tìm và trích xuất chính xác tên Nhân viên bán hàng (NVBH) hoặc Nhân viên giao hàng có trên phiếu.
    2. ĐỒNG BỘ LOGIC [COLGATE]: Áp dụng toàn bộ tính năng cao cấp của KIDO và UNICHARM cho Colgate. 
       - Trích xuất 100% dòng hàng tặng/KM (Đơn giá 0) thành các dòng hàng riêng biệt.
       - Xử lý tách số dính OCR (Ví dụ: "10thùng", "5hộp" -> tách số và chữ).
       - Giữ nguyên Tên hàng nguyên văn (bao gồm cả VIPSHOP, ONTOP, Trả Thưởng).
    3. HÀNG TẶNG / KHUYẾN MẠI: Mọi dòng có số lượng nhưng đơn giá 0 hoặc ghi chú KM phải được trích xuất đầy đủ thông tin.
    4. TÊN HÀNG NGUYÊN VĂN: Tuyệt đối giữ nguyên chuỗi ký tự hiển thị trên phiếu. Không tự ý "làm sạch" hay "chuẩn hóa" tên sản phẩm.
    5. SỐ PHIẾU/SỐ HĐ: Tìm và gán Số phiếu/Số HĐ cho mọi dòng hàng trích xuất được.

    LOGIC NHÓM CHI TIẾT:
    - KIDO: Trích xuất mã [xxxx], giữ nguyên Tên & Đơn giá dòng VIPSHOP/ONTOP.
    - UNICHARM: Tách OCR dính số, phục hồi 100% hàng tặng KM đơn giá 0.
    - COLGATE (NEW LOGIC): Kết hợp logic của KIDO & UNICHARM. Tập trung trích xuất chính xác mã CP (Promotion), xử lý dính số OCR ở cột ĐVT/Số lượng, và đảm bảo không bỏ sót bất kỳ dòng quà tặng KM nào.
    - KIOTVIET_NPP: Loại bỏ hậu tố -TH nhưng giữ nguyên Tên hàng.

    YÊU CẦU: Trả về JSON ARRAY duy nhất. Không giải thích. Xử lý với latency thấp nhất.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: fileBase64, mimeType: mimeType } },
          { text: `Phân tích phiếu ${group} với logic V10.5. Trích xuất đầy đủ hàng tặng KM, Nhân viên bán hàng và xử lý dính số OCR.` }
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
  if (!text) throw new Error("AI Studio không phản hồi dữ liệu.");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Lỗi cấu trúc dữ liệu AI V10.5.");
  }
};
