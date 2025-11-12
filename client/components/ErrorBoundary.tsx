import React, { Component, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { logger } from "@/utils/logger";

/**
 * Sanitizes error message for display (removes sensitive patterns)
 */
function sanitizeErrorMessage(message: string): string {
  // Pattern to match JWT tokens
  const jwtPattern = /[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/g;
  // Pattern to match bearer tokens
  const bearerTokenPattern = /bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
  // Pattern to match long alphanumeric strings (potential tokens/keys)
  const tokenPattern = /\b[A-Za-z0-9]{32,}\b/g;

  let sanitized = message;
  sanitized = sanitized.replace(jwtPattern, "[TOKEN_REDACTED]");
  sanitized = sanitized.replace(bearerTokenPattern, "bearer [TOKEN_REDACTED]");
  sanitized = sanitized.replace(tokenPattern, (match) =>
    match.length > 40 ? "[TOKEN_REDACTED]" : match
  );

  return sanitized;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error using our secure logger
    logger.error("ErrorBoundary caught an error", error);
    logger.error("Error info", errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                <Text style={styles.errorText}>
                  {sanitizeErrorMessage(this.state.error.toString())}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorText}>
                    {sanitizeErrorMessage(
                      this.state.errorInfo.componentStack || ""
                    )}
                  </Text>
                )}
              </View>
            )}
            <Pressable style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(56 56 58)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  errorDetails: {
    width: "100%",
    backgroundColor: "#1f1f1f",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgb(249 218 71)",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "rgb(249 218 71)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

