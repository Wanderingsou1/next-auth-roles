import CloudConvert from "cloudconvert";

const cloudConvert = new CloudConvert(
  process.env.CLOUDCONVERT_API_KEY!
);

export async function convertDocToDocx(
  buffer: Buffer
): Promise<Buffer> {
  const job = await cloudConvert.jobs.create({
    tasks: [
      {
        name: "import-file",
        operation: "import/base64",
        file: buffer.toString("base64"),
        filename: "input.doc",
      },
      {
        name: "convert-file",
        operation: "convert",
        input: ["import-file"],
        input_format: "doc",
        output_format: "docx",
      },
      {
        name: "export-file",
        operation: "export/base64",
        input: ["convert-file"],
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any); // ⬅️ THIS IS THE KEY FIX

  const completedJob = await cloudConvert.jobs.wait(job.id);

  const exportTask = completedJob.tasks.find(
    (t) => t.name === "export-file"
  );

  if (!exportTask || exportTask.status !== "finished") {
    throw new Error("CloudConvert export failed");
  }

  const files = exportTask.result?.files as Array<{
    filename: string;
    file: string;
  }>;

  return Buffer.from(files[0].file, "base64");
}
