interface BlankLayoutProps {
  children: React.ReactNode
}

export function BlankLayout({ children }: BlankLayoutProps) {
  return (
    <div className="min-h-screen flex flex-column">
      {children}
    </div>
  )
}
