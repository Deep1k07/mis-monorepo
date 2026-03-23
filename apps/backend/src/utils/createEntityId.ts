
export function generateAlphanumericCode(length = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}

// export function generateEntityId(length: number = 4) {
//     const nanoid = customAlphabet(
//         'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
//         length
//     );
//     return nanoid();
// }