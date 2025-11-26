export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const skeletons = {
    card: (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    ),
    
    table: (
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-200 mb-2"></div>
        <div className="space-y-2 p-4">
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      </div>
    ),
    
    list: (
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    
    form: (
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{skeletons[type]}</div>
      ))}
    </div>
  )
}
