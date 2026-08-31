export interface CreateCustomerData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode?: string;
}

export async function baasRequest(method: string, path: string, body?: unknown) {
    const baseUrl = process.env.ANCHOR_BASE_URL;
    const apiKey = process.env.ANCHOR_API_KEY;
    if (!baseUrl || !apiKey) {
        throw new Error("ANCHOR_BASE_URL and ANCHOR_API_KEY must be set in environment variables");
    }

    const url = `${baseUrl}${path}`;
    const headers = {
        "x-anchor-key": apiKey,
        "Content-Type": "application/json",
    };

    const response = await fetch(url, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("[baasRequest] Anchor error response:", JSON.stringify(errorData, null, 2));
        throw Object.assign(
            new Error(errorData.errors?.[0]?.detail || errorData.message || "Anchor API request failed"),
            { statusCode: response.status }
        );
    }

    return response.json();
}

export async function createCustomer(userId: string, data: CreateCustomerData) {
    const payload = {
        data: {
            type: "IndividualCustomer",
            attributes: {
                fullName: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                },
                address: {
                    addressLine_1: data.addressLine1,
                    addressLine_2: data.addressLine2 ?? "",
                    city: data.city,
                    state: data.state,
                    postalCode: data.postalCode ?? "",
                    country: "NG",
                },
                email: data.email,
                phoneNumber: data.phoneNumber,
                metadata: {
                    pocketwise_userId: userId,
                },
            },
        },
    };

    const res = await baasRequest("POST", "/api/v1/customers", payload);

    return res.data.id as string;
}