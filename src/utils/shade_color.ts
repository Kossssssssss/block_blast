export function shadeColor( hex: string, percent: number ): string
{
  const num = parseInt( hex.slice( 1 ), 16 );
  let r = ( num >> 16 ) & 255;
  let g = ( num >> 8 ) & 255;
  let b = num & 255;

  r = Math.min( 255, Math.max( 0, r + ( r * percent ) / 100 ) );
  g = Math.min( 255, Math.max( 0, g + ( g * percent ) / 100 ) );
  b = Math.min( 255, Math.max( 0, b + ( b * percent ) / 100 ) );

  return `rgb(${Math.round( r )}, ${Math.round( g )}, ${Math.round( b )})`;
}
