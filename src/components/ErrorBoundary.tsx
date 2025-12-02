"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md text-center">
            <div className="text-5xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Đã xảy ra lỗi
            </h2>
            <p className="text-gray-600 mb-4">
              Có gì đó không ổn. Vui lòng thử lại.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleReset}>Thử lại</Button>
              <Button variant="ghost" onClick={() => window.location.href = "/"}>
                Về trang chủ
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
