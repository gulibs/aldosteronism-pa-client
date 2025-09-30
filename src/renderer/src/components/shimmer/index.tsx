'use client'

import { cn } from '@renderer/lib/utils'
import './index.css'

type ShimmerDirection = 'left' | 'right'

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  type?: 'text' | 'content'
  angle?: string
  duration?: string
  gradientColors?: string | string[]
  bandWidth?: string // 新增：扫光带宽度
  easing?: React.CSSProperties['animationTimingFunction']
  direction?: ShimmerDirection
  delay?: string
}

export const Shimmer: React.FC<ShimmerProps> = ({
  children,
  type = 'text',
  className,
  bandWidth = '20%', // 默认扫光带宽度
  angle = '-45deg',
  duration = '2.5s',
  gradientColors = '#ffffff88',
  easing = 'ease-in-out',
  direction = 'right',
  delay = '0s',
  ...props
}) => {
  // 方向值转换
  const directionValue = direction === 'left' ? -1 : 1

  // 计算扫光带位置
  const finalRatio = {
    left: `calc(50% - (${bandWidth})/2)`,
    right: `calc(50% + (${bandWidth})/2)`
  }

  const shimmerStyles: React.CSSProperties = {
    '--shimmer-angle': angle,
    '--shimmer-duration': duration,
    '--shimmer-gradient-colors':
      typeof gradientColors === 'string' ? gradientColors : gradientColors.join(','),
    '--shimmer-ratio-left': finalRatio.left,
    '--shimmer-ratio-right': finalRatio.right,
    '--shimmer-easing': easing,
    '--shimmer-delay': delay,
    '--shimmer-direction': directionValue
  } as React.CSSProperties

  return (
    <div
      className={cn(
        'shimmer-wrapper',
        {
          'shimmer-text': type === 'text',
          'shimmer-content': type === 'content'
        },
        className
      )}
      style={shimmerStyles}
      {...props}
    >
      {children}
      {type === 'text' && (
        <div className="absolute left-0 top-0 right-0 bottom-0 w-full h-full shimmer-overlay !bg-clip-text">
          {children}
        </div>
      )}
    </div>
  )
}
