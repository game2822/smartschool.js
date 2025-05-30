export const downloadAttachment = async(url: string, accessToken?: string): Promise<Buffer> => {
    const response = await fetch(url, {
        method:  "GET",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return buffer;
};
