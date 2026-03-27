

// apis

export const getAllBa = async () => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ba/get-all`,
        { credentials: "include" });
    return response;
}

export const getEntityById = async (id: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/entity/${id}`,
        { credentials: "include" });
    return response;
}

export const getCountry = async () => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/country`,
        { credentials: 'include' }
    );

    return response;
}

export const createEntity = async (data: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/entity`,
        {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    return response;
}