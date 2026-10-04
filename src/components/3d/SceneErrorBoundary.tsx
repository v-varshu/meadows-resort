import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Mountain, RotateCcw } from 'lucide-react';
import { RESORT_ASSETS } from '../../data/resort';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackImage?: string;
  heightClass?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SceneErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Non-intrusive logging without telemetry
    console.warn('[SceneErrorBoundary] 3D Canvas error caught safely:', error.message, errorInfo.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      const img = this.props.fallbackImage || RESORT_ASSETS.hero;
      const height = this.props.heightClass || 'h-[360px] md:h-[440px]';

      return (
        <div className={`relative w-full ${height} rounded-xl overflow-hidden bg-[#071916] border border-[#D4B47A]/30 flex flex-col items-center justify-center p-6 text-center shadow-lg`}>
          <img
            src={img}
            alt="The Meadows Resort Kodaikanal sanctuary view"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050708] via-[#050708]/50 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#092B25] border border-[#D4B47A]/40 flex items-center justify-center text-[#D4B47A]">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#D4B47A] font-medium">
                {this.props.fallbackTitle || 'Highland Sanctuary Atmosphere'}
              </div>
              <p className="text-xs text-[#C5D1D0] mt-1 leading-relaxed">
                3D WebGL acceleration is operating in optimized visual mode.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold tracking-wider uppercase rounded-lg bg-[#123C32] text-[#F2E9D8] border border-[#D4B47A]/40 hover:bg-[#D4B47A] hover:text-[#050708] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry 3D Experience</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
