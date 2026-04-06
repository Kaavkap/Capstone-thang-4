import React from "react";

// Fixed grid constants based on your current layout
const seatRows = ["A", "B", "C", "D", "E", "F"];
const seatPerRow = 8;

// Exporting this allows BookingPage to know the valid codes
export const allSeatCodes = seatRows.flatMap((row) =>
  Array.from({ length: seatPerRow }, (_, index) => `${row}${index + 1}`)
);

function SeatMap({ selectedSeats, bookedSeats, onSelectSeat }) {
  // Using Sets for O(1) lookup performance during render
  const selectedSet = new Set(selectedSeats);
  const bookedSet = new Set(bookedSeats);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Screen Visualizer */}
      <div className="mb-12 relative">
        <div className="h-2 w-full bg-slate-300 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)]"></div>
        <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Màn hình (Screen)
        </div>
      </div>

      {/* Seat Grid */}
      <div className="grid grid-cols-8 gap-3 sm:gap-4">
        {allSeatCodes.map((seatCode) => {
          const isBooked = bookedSet.has(seatCode);
          const isSelected = selectedSet.has(seatCode);

          return (
            <button
              key={seatCode}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectSeat(seatCode)}
              className={`
                relative flex items-center justify-center rounded-md text-[10px] font-bold transition-all duration-200
                aspect-square border-2
                ${
                  isBooked
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300" // Booked Style
                    : isSelected
                      ? "border-brand-600 bg-brand-600 text-white shadow-md transform scale-105" // Selected Style
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600" // Available Style
                }
              `}
            >
              {seatCode}
              
              {/* Optional: Small dot indicator for VIP seats (if applicable) */}
              {seatCode.startsWith("C") || seatCode.startsWith("D") ? (
                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400'}`}></span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-10 flex justify-center gap-6 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-slate-200 bg-white"></div>
          <span>Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-brand-600 bg-brand-600"></div>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-slate-200 bg-slate-100"></div>
          <span>Đã đặt</span>
        </div>
      </div>
    </div>
  );
}

export default SeatMap;