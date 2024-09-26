import { DocumentExtension } from "@prisma/client";

export class CreateTypeDocumentDto {
  name: string;
  extension: DocumentExtension;
  // Adjust according to your enum or type
}
