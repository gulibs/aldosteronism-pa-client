import clsx from 'clsx'

export default function PageContainer({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx('w-full max-w-4xl bg-white shadow-sm rounded-md overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
}
