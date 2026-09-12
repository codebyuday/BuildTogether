export default function ShimmerButton({ children, className = '', ...props }) {
  return (
    <button className={`shimmer-btn ${className}`} {...props}>
      {children}
    </button>
  )
}
