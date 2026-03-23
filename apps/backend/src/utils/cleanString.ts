export const cleanString = (str: string) =>
    str
        ?.replace(/^[^a-zA-Z0-9"]+|[^a-zA-Z0-9.")"]+$/g, '')
        .replace(/"{2,}/g, '"')
        .replace(/\.+/g, '.')
        .replace(/\)+$/, ')')
        .trim();