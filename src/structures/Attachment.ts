import { downloadAttachment } from "../routes/Attachments";

/**
 * Represents an attachment that can be include in news, assignment or message.
 */
export class Attachment {
    /**
     *
     * @param accessToken - Used to download the protected attachment.
     * @param id - Unique ID for each attachment.
     * @param fileName - Name of the file attached.
     * @param type - MIME Type of the attachment (https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types).
     * @param typeLabel - Label of the MIME Type (e.g., 'Document Word')
     * @param size - Size of the document in bytes
     * @param url - URL used to download this attachment.
     */
    constructor(
        protected accessToken: string,
        public id: string,
        public fileName: string,
        public type: string,
        public typeLabel: string,
        public size: number,
        public url: string
    ){}

    /**
     * Downloads the attachment and returns its raw binary content.
     * @returns Raw binary content.
     */
    fetchAttachmentBuffer(): Promise<Buffer> {
        return downloadAttachment(this.url, this.accessToken);
    }
}
