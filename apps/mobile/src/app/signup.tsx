import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, ChevronLeft, Check, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";

const Signup = () => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabel = ["Enter password", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#e2e8f0", "#ef4444", "#f59e0b", "#7c3aed", "#10b981"];

  const getBarColor = (index: number) => {
    if (strength === 0 || strength < index + 1) return "#e2e8f0";
    return strengthColors[strength];
  };

  const handleStep1Submit = () => {
    setStep(2);
  };

  const handleStep2Submit = async () => {
    setLoading(true);
    try {
      // Add signup logic here
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setStep(1);

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "").slice(0, 11);
    let formatted = digitsOnly;
    if (digitsOnly.length > 4) {
      formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
    }
    if (digitsOnly.length > 7) {
      formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(
        4,
        7,
      )} ${digitsOnly.slice(7)}`;
    }
    setPhoneNumber(formatted);
  };

  const handleDateChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "").slice(0, 8);
    let formatted = digitsOnly;
    if (digitsOnly.length > 4) {
      formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
    }
    if (digitsOnly.length > 6) {
      formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(
        4,
        6,
      )}-${digitsOnly.slice(6)}`;
    }
    setDateOfBirth(formatted);
  };

  const passwordsMatch = password === confirmPassword;
  const isPasswordStrong = strength >= 3;

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(email.trim());

  const isStep1Complete =
    isEmailValid &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    passwordsMatch &&
    isPasswordStrong;

  const isStep2Complete =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    userName.trim() !== "" &&
    phoneNumber.replace(/\D/g, "").length === 11 &&
    dateOfBirth.length === 10 &&
    termsAccepted;

  const step1Disabled = loading || !isStep1Complete;
  const step2Disabled = loading || !isStep2Complete;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          step === 2 && styles.containerStep2,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {step === 2 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={18} color="#64748b" />
          </TouchableOpacity>
        )}

        {/* Step progress */}
        <View style={styles.progressWrapper}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Step {step} of 2</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {step === 1 ? "Account" : "Profile"}
              </Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: step === 1 ? "50%" : "100%" },
              ]}
            />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 1 ? "Create your account" : "Tell us about yourself"}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Start managing your money smarter in seconds."
              : "We need a few more details to set up your profile."}
          </Text>
        </View>

        {step === 1 ? (
          <View style={styles.form}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[
                  styles.input,
                  !!email && !isEmailValid && styles.inputError,
                ]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
              {!!email && !isEmailValid && (
                <Text style={styles.errorText}>
                  Enter a valid email address
                </Text>
              )}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>

              {!!password && (
                <View style={styles.strengthWrapper}>
                  <View style={styles.strengthRow}>
                    {[0, 1, 2, 3].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: getBarColor(index) },
                        ]}
                      />
                    ))}
                    <Text style={styles.strengthLabel}>
                      {strengthLabel[strength]}
                    </Text>
                  </View>
                  <Text style={styles.strengthHint}>
                    Use 8+ characters with uppercase, numbers & symbols —
                    reach "Strong" to continue
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Confirm password</Text>
              <View
                style={[
                  styles.passwordRow,
                  !!confirmPassword && !passwordsMatch && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
              {!!confirmPassword && !passwordsMatch && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleStep1Submit}
              disabled={step1Disabled}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={step1Disabled ? ["#e2e8f0", "#e2e8f0"] : ["#7c3aed", "#9333ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Continue</Text>
                    <ArrowRight size={16} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login" as any)}>
                <Text style={styles.linkText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.fieldWrapper, styles.half]}>
                <Text style={styles.label}>First name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
              </View>
              <View style={[styles.fieldWrapper, styles.half]}>
                <Text style={styles.label}>Last name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#94a3b8"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="number-pad"
                maxLength={13}
                placeholder="0800 000 0000"
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Date of birth</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={handleDateChange}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.85}
              style={[
                styles.termsBox,
                termsAccepted && styles.termsBoxActive,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxActive,
                ]}
              >
                {termsAccepted && <Check size={12} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                I confirm that I am at least 16 years old and I agree to the{" "}
                <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStep2Submit}
              disabled={step2Disabled}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={step2Disabled ? ["#e2e8f0", "#e2e8f0"] : ["#7c3aed", "#9333ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login" as any)}>
                <Text style={styles.linkText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 40,
  },
  containerStep2: {
    paddingTop: 130,
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  progressWrapper: { marginBottom: 24 },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressBadge: {
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ede9fe",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6d28d9",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 999,
  },
  header: { marginBottom: 28 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  form: { gap: 20 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  fieldWrapper: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  input: {
    backgroundColor: "#f8f7fb",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f7fb",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  eyeButton: { padding: 4 },
  inputError: { borderColor: "#ef4444" },
  errorText: {
    fontSize: 11,
    color: "#ef4444",
    fontWeight: "600",
    marginTop: 2,
  },
  strengthWrapper: { gap: 6, marginTop: 2 },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  strengthBar: { flex: 1, height: 6, borderRadius: 999 },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    width: 56,
    textAlign: "right",
  },
  strengthHint: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  termsBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  termsBoxActive: {
    borderColor: "#ddd6fe",
    backgroundColor: "#f5f3ff",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
    lineHeight: 18,
  },
  buttonWrapper: { borderRadius: 14, overflow: "hidden" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7c3aed",
  },
});

export default Signup;