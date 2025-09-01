import { Attachment } from "./Attachment";
import { Subject, Teacher } from "../types/Assignment";
import { GetAssignmentAttachments, SetAssignmentCompletion } from "../routes/Assignments";

/**
 * Represents a school assignment given to a student, including metadata, subject, teacher, and completion status.
 */
export class Assignment {
    /**
     * @param accessToken - Token required to fetch attachments or update completion status.
     * @param userId - Unique student identifier (usually prefixed with "ESKO-").
     * @param id - Unique assignment identifier.
     * @param done - Whether the student has completed the assignment.
     * @param title - Title of the assignment (e.g., "Exercises", "Autres").
     * @param html - HTML-formatted content of the assignment.
     * @param dueDateTime - Deadline for submitting the assignment.
     * @param deliverWorkOnline - Whether the student must submit work through an online platform.
     * @param onlineDeliverUrl - URL where the student can upload their work, if applicable.
     * @param teacher optional - The teacher who assigned the work.
     * @param subject - The school subject associated with this assignment.
     */
    constructor(
        protected accessToken: string,
        public userId: string,
        public id: string,
        public done: boolean,
        public title: string,
        public html: string,
        public dueDateTime: Date,
        public deliverWorkOnline: boolean,
        public onlineDeliverUrl: string | null,
        public subject: Subject,
        public teacher?: Teacher
    ) {}

    /**
     * Fetches the list of attachments associated with this assignment.
     * @returns A promise resolving to an array of attachments.
     */
    async getAttachments(): Promise<Array<Attachment>> {
        return GetAssignmentAttachments(
            this.id,
            this.userId,
            this.accessToken
        );
    }

    /**
     * Updates the assignment's completion status for this student.
     * @param completed - Optional. Whether the assignment is completed. Defaults to toggling the current value.
     * @returns A promise resolving to the updated Assignment instance.
     */
    async setCompletion(completed?: boolean): Promise<Assignment> {
        const newDoneState = completed ?? !this.done;
        return SetAssignmentCompletion(
            this.id,
            this.userId,
            newDoneState,
            this.accessToken
        );
    }
}
