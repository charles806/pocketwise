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

export interface UpgradeCustomerKYCData {
    dateOfBirth: string;
    gender: string;
    bvn: string
}

export interface AnchorAccountNumber {
    id: string;
    type: string;
    attributes: {
        createdAt?: string;
        bank?: {
            id?: string;
            name?: string;
            nipCode?: string;
        };
        isDefault?: boolean;
        accountName?: string;
        permanent?: boolean;
        currency?: string;
        accountNumber: string;
        status?: string;
    };
    relationships?: {
        settlementAccount?: { data?: { id?: string; type?: string } };
        customer?: { data?: { id?: string; type?: string } };
    };
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

export async function upgradeCustomerKYC(anchorCustomerId: string, data: UpgradeCustomerKYCData) {
    const payload = {
        data: {
            type: "Verification",
            attributes: {
                level: "TIER_2",
                level2: {
                    bvn: data.bvn,
                    dateOfBirth: data.dateOfBirth,
                    gender: data.gender,
                },
            },
        },
    };

    const res = await baasRequest(
        "POST",
        `/api/v1/customers/${anchorCustomerId}/verification/individual`,
        payload,
    );

    return res.data;
}

export async function createDepositAccount(anchorCustomerId: string, userId: string) {
    const payload = {
        data: {
            type: "DepositAccount",
            attributes: {
                productName: "SAVINGS",
                metadata: {
                    pocketwise_userId: userId
                }
            },
            relationships: {
                customer: {
                    data: {
                        id: anchorCustomerId,
                        type: "IndividualCustomer"
                    }
                }
            }
        }
    }

    const res = await baasRequest("POST", "/api/v1/accounts", payload)

    return res.data.id
}

export async function getDepositAccount(anchorAccountId: string) {
    const res = await baasRequest("GET", `/api/v1/accounts/${anchorAccountId}`);
    return res.data;
}



export async function getAccountNumber(anchorAccountId: string): Promise<AnchorAccountNumber> {
    const res = await baasRequest(
        "GET",
        `/api/v1/account-numbers?AccountId=${encodeURIComponent(anchorAccountId)}`,
    );
    return (res.data ?? [])[0];
}

export interface CustomerVerification {
    status?: string;
    level?: string;
    details?: Array<{ status?: string; type?: string; validatedItems?: unknown[] }>;
}

export async function getCustomerVerification(anchorCustomerId: string): Promise<CustomerVerification | undefined> {
    const res = await baasRequest("GET", `/api/v1/customers/${anchorCustomerId}`);
    return res?.data?.attributes?.verification;
}

export interface DepositAccountDetails {
    depositAccountId: string;
    nuban: string;
    bankName?: string;
    accountName?: string;
}

export interface FreezeAccountData {
    freezeReason: string;
    freezeDescription: string;
}

export async function freezeDepositAccount(anchorAccountId: string, data: FreezeAccountData) {
    const payload = {
        data: {
            type: "DepositAccount",
            attributes: {
                freezeReason: data.freezeReason,
                freezeDescription: data.freezeDescription,
            },
        },
    };

    const res = await baasRequest("POST", `/api/v1/accounts/${anchorAccountId}/freeze`, payload);
    return res.data;
}

export async function unfreezeDepositAccount(anchorAccountId: string) {
    const payload = {
        data: {
            id: anchorAccountId,
            type: "DepositAccount",
            attributes: {},
        },
    };

    const res = await baasRequest("POST", "/api/v1/accounts/unfreeze", payload);
    return res.data;
}

export async function updateDepositAccountMetadata(anchorAccountId: string, metadata: Record<string, string>) {
    const payload = {
        data: {
            type: "DepositAccount",
            attributes: {
                metadata,
            },
        },
    };

    const res = await baasRequest("PATCH", `/api/v1/accounts/${anchorAccountId}`, payload);
    return res.data;
}

export async function createDepositAccountWithDetails(
    anchorCustomerId: string,
    userId: string,
): Promise<DepositAccountDetails> {
    const depositAccountId = await createDepositAccount(anchorCustomerId, userId);

    let bankName: string | undefined;
    let accountName: string | undefined;
    try {
        const account = await getDepositAccount(depositAccountId);
        bankName = account?.attributes?.bank?.name;
        accountName = account?.attributes?.accountName;
    } catch (error) {
        console.error("[baas] Failed to fetch deposit account metadata:", error);
    }

    let nuban = "";
    try {
        const accountNumber = await getAccountNumber(depositAccountId);
        nuban = accountNumber?.attributes?.accountNumber ?? "";
    } catch (error) {
        console.error("[baas] Failed to fetch account number:", error);
    }

    return {
        depositAccountId,
        nuban,
        ...(bankName ? { bankName } : {}),
        ...(accountName ? { accountName } : {}),
    };
}

export async function createCounterParty(bankCode: string, accountNumber: string, accountName: string) {
    const payload = {
        data: {
            type: "CounterParty",
            attributes: {
                bankCode,
                accountNumber,
                accountName,
                verifyName: true
            }
        }
    }

    const res = await baasRequest("POST", "/api/v1/counterparties", payload)

    return { id: res.data.id as string, type: res.data.type as string }
}

export async function getCounterParty(counterPartyId: string) {
    const res = await baasRequest("GET", `/api/v1/counterparties/${counterPartyId}`)
    return res
}

export async function initiateNIPTransfer(sourceAccountId: string, counterPartyId: string, amountInKobo: number, reason: string, reference: string) {
    const payload = {
        data: {
            type: "NIPTransfer",
            attributes: {
                amount: amountInKobo,
                currency: "NGN",
                reason,
                reference
            },
            relationships: {
                account: {
                    data: { id: sourceAccountId, type: "DepositAccount" }
                },
                counterParty: {
                    data: { id: counterPartyId, type: "CounterParty" }
                }
            }
        }
    }

    const response = await baasRequest("POST", "/api/v1/transfers", payload)

    return response.data.id as string
}
