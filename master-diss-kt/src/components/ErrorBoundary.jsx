import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(){
    return { hasError: true };
  }
  componentDidCatch(err, info){
    
  }
  render(){
    if (this.state.hasError) {
      return (
        <div className="chart-card" style={{ textAlign: "center", padding: "1rem" }}>
          <strong>Sorry — this chart couldn’t render.</strong>
          <div style={{ color: "#666", marginTop: 6 }}>Try reloading the page.</div>
        </div>
      );
    }
    return this.props.children;
  }
}
