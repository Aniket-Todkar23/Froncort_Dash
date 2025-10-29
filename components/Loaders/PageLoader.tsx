import './PageLoader.css'

interface PageLoaderProps {
  isLoading: boolean
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 p-4">
      <div id="triangle" className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64">
        <svg id="Layer_1" data-name="Layer 1" version="1.1" viewBox="0 0 2000 2000" className="w-full h-full">
          <polygon
            className="cls-1"
            points="928 781 1021 951 784.5 1371.97 1618 1371.97 1530.32 1544 509 1539 928 781"
          ></polygon>
          <polygon
            className="cls-3"
            points="1618 1371.97 784.5 1371.97 874.93 1211 1346 1211 923.1 456 1110.06 456 1618 1371.97"
          ></polygon>
          <g id="Layer_2" data-name="Layer 2">
            <polygon
              className="cls-2"
              points="418 1372.74 509 1539 928 781 1162.32 1211 1346 1211 923.1 456 418 1372.74"
            ></polygon>
          </g>
        </svg>
      </div>
    </div>
  )
}
