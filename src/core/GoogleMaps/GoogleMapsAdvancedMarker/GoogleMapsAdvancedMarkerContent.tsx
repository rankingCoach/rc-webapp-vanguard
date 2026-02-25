import React from 'react';

/**
 * Props for GoogleMapsAdvancedMarkerContent component
 */
export interface GoogleMapsAdvancedMarkerContentProps {
  /** Icon image URL (data URL or external URL). If provided, displays as img element */
  icon?: string;
  /** Size of the marker icon in pixels */
  size?: { x: number; y: number };
  /** Color for the default pin marker (only used if icon is not provided) */
  color?: string;
}

/**
 * GoogleMapsAdvancedMarkerContent Component
 *
 * Provides default visual content for GoogleMapsAdvancedMarker. This component renders either:
 * - A custom icon image if `icon` prop is provided
 * - A default pin SVG with customizable color if no icon is provided
 *
 * Since AdvancedMarkerElement uses HTML content instead of icon URLs,
 * this component acts as a bridge to maintain familiar icon-based workflows.
 *
 * @example
 * ```tsx
 * // Default pin with custom color
 * <GoogleMapsAdvancedMarker id="1" pos={position}>
 *   <GoogleMapsAdvancedMarkerContent color="#4285F4" />
 * </GoogleMapsAdvancedMarker>
 *
 * // Custom icon image
 * <GoogleMapsAdvancedMarker id="2" pos={position}>
 *   <GoogleMapsAdvancedMarkerContent
 *     icon="data:image/png;base64,..."
 *     size={{ x: 32, y: 40 }}
 *   />
 * </GoogleMapsAdvancedMarker>
 * ```
 */
export const GoogleMapsAdvancedMarkerContent = ({
  icon,
  size = { x: 28, y: 35 },
  color = '#EA4335',
}: GoogleMapsAdvancedMarkerContentProps) => {
  if (icon) {
    return (
      <img
        src={icon}
        alt="marker"
        draggable={false}
        style={{
          width: `${size.x}px`,
          height: `${size.y}px`,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      />
    );
  }

  // Default Google Maps-style pin SVG
  return (
    <svg
      width={size.x}
      height={size.y}
      viewBox="0 0 24 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: 'pointer' }}
    >
      <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 23 12 23s12-15 12-23c0-6.6-5.4-12-12-12z" fill={color} />
      <circle cx="12" cy="12" r="4" fill="white" />
    </svg>
  );
};
