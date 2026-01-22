import mammoth from "mammoth";

type ExtractInput = {
  mimeType: string;
  buffer: Buffer;
};

type ExtractOutput = {
  text: string;
  html: string;
};

function normalizeText(text: string) {
  return (text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractDocumentContent({
  mimeType,
  buffer,
}: ExtractInput): Promise<ExtractOutput> {
  /**
   * DOCX → extract HTML + text
   */
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const textResult = await mammoth.extractRawText({ buffer });

    return {
      html: htmlResult.value ?? "",
      text: normalizeText(textResult.value ?? ""),
    };
  }

  // /**
  //  * DOC → text only
  // */
  // console.log("checkpoint 6")
  
  // if (mimeType === "application/msword") {
  //   try {
  //       const textResult = await mammoth.extractRawText({ buffer });
  //       console.log(textResult);

  //       return {
  //         html: "",
  //         text: normalizeText(textResult.value ?? ""),
  //       };
  //   } catch(e) {
  //     console.error("Extraction Failed: ", e);
  //   }
  // }


  /**
   * PDF → plain text only (via unpdf)
   */
if (mimeType === "application/pdf") {
  const { extractText } = await import("unpdf");

  const result = await extractText(new Uint8Array(buffer));
  // result.text is string[] (one entry per page)

  const combinedText = result.text.join("\n");

  return {
    text: normalizeText(combinedText),
    html: "",
  };
}

  /**
   * unsupported → no extraction
   */
  return {
    text: "",
    html: "",
  };
}
