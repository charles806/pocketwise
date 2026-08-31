import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { SlideUpContainer } from "../SlideUpContainer";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
].sort();

export const AddressModal = () => {
  const { user, accessToken, isLoading, refreshSession } = useAuth();
  const [visible, setVisible] = useState(false);
  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && user && !(user as any).addressLine1) {
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  const isValid =
    addressLine1.trim().length > 0 &&
    city.trim().length > 0 &&
    state.length > 0;

  const handleSubmit = async () => {
    if (!isValid || !accessToken) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/onboarding/address`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Client-Type": "mobile",
        },
        body: JSON.stringify({
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state,
          postalCode: postalCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to save address");
        return;
      }
      await refreshSession();
      setVisible(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <SlideUpContainer>
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
              }}
            >
              <View style={{ padding: 24, paddingBottom: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 16,
                        backgroundColor: "#eef2ff",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <MapPin size={20} color="#4f46e5" />
                    </View>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "800",
                        color: "#0f172a",
                      }}
                    >
                      Where do you live?
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#475569", marginTop: 4 }}
                    >
                      We need this for identity verification.
                    </Text>
                  </View>
                </View>
              </View>

              <ScrollView
                style={{ paddingHorizontal: 24 }}
                contentContainerStyle={{ gap: 12 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Street address */}
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: 6,
                      marginLeft: 2,
                    }}
                  >
                    Street address *
                  </Text>
                  <TextInput
                    placeholder="123 Main Street"
                    placeholderTextColor="#94a3b8"
                    value={addressLine1}
                    onChangeText={setAddressLine1}
                    style={{
                      backgroundColor: "#f8f7fb",
                      borderWidth: 1.5,
                      borderColor: "#e2e8f0",
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: "#0f172a",
                    }}
                  />
                </View>

                {/* Apartment / suite */}
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: 6,
                      marginLeft: 2,
                    }}
                  >
                    Apartment / suite
                  </Text>
                  <TextInput
                    placeholder="Apt 4B"
                    placeholderTextColor="#94a3b8"
                    value={addressLine2}
                    onChangeText={setAddressLine2}
                    style={{
                      backgroundColor: "#f8f7fb",
                      borderWidth: 1.5,
                      borderColor: "#e2e8f0",
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: "#0f172a",
                    }}
                  />
                </View>

                {/* City */}
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: 6,
                      marginLeft: 2,
                    }}
                  >
                    City *
                  </Text>
                  <TextInput
                    placeholder="Lagos"
                    placeholderTextColor="#94a3b8"
                    value={city}
                    onChangeText={setCity}
                    style={{
                      backgroundColor: "#f8f7fb",
                      borderWidth: 1.5,
                      borderColor: "#e2e8f0",
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: "#0f172a",
                    }}
                  />
                </View>

                {/* State */}
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: 6,
                      marginLeft: 2,
                    }}
                  >
                    State *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setStatePickerVisible(true)}
                    style={{
                      backgroundColor: "#f8f7fb",
                      borderWidth: 1.5,
                      borderColor: "#e2e8f0",
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: state ? "#0f172a" : "#94a3b8",
                      }}
                    >
                      {state || "Select a state"}
                    </Text>
                    <ChevronDown size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Postal code */}
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: 6,
                      marginLeft: 2,
                    }}
                  >
                    Postal code
                  </Text>
                  <TextInput
                    placeholder="100001"
                    placeholderTextColor="#94a3b8"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: "#f8f7fb",
                      borderWidth: 1.5,
                      borderColor: "#e2e8f0",
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: "#0f172a",
                    }}
                  />
                </View>

                {/* Error */}
                {error ? (
                  <View
                    style={{
                      backgroundColor: "#fef2f2",
                      borderWidth: 1,
                      borderColor: "#fecaca",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#dc2626" }}>
                      {error}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={{ padding: 24, gap: 8 }}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isValid || saving}
                  style={{
                    backgroundColor: isValid ? "#4f46e5" : "#94a3b8",
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {saving && <ActivityIndicator color="#fff" size="small" />}
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    {saving ? "Saving..." : "Save Address →"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SlideUpContainer>
        </View>
      </Modal>

      {/* State picker modal */}
      <Modal
        visible={statePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatePickerVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <SlideUpContainer>
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                maxHeight: "60%",
              }}
            >
              <View
                style={{
                  padding: 24,
                  paddingBottom: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  Select your state
                </Text>
                <TouchableOpacity
                  onPress={() => setStatePickerVisible(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#f1f5f9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#64748b" }}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ paddingHorizontal: 24 }}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {NIGERIAN_STATES.map((s) => {
                  const isSelected = state === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        setState(s);
                        setStatePickerVisible(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 14,
                        paddingHorizontal: 4,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f1f5f9",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: isSelected ? "700" : "500",
                          color: isSelected ? "#4f46e5" : "#0f172a",
                        }}
                      >
                        {s}
                      </Text>
                      {isSelected && (
                        <Check size={18} color="#4f46e5" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </SlideUpContainer>
        </View>
      </Modal>
    </>
  );
};

export default AddressModal;
