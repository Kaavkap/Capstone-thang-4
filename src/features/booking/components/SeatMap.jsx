const seatRows = ["A", "B", "C", "D", "E", "F"];
const seatPerRow = 8;

export const allSeatCodes = seatRows.flatMap((row) =>
  Array.from({ length: seatPerRow }, (_, index) => `${row}${index + 1}`)
);

function SeatMap({ selectedSeats, bookedSeats, onSelectSeat }) {
  const selectedSet = new Set(selectedSeats);
  const bookedSet = new Set(bookedSeats);

  return (
    <div>
      <div className="mb-4 rounded-xl bg-slate-900 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white">
        Màn hình
      </div>

      <div className="grid grid-cols-8 gap-2">
        {allSeatCodes.map((seatCode) => {
          const isBooked = bookedSet.has(seatCode);
          const isSelected = selectedSet.has(seatCode);

          return (
            <button
              key={seatCode}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectSeat(seatCode)}
              className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
                isBooked
                  ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-400"
                  : isSelected
                    ? "border-brand-700 bg-brand-600 text-white"
                    : "border-brand-100 bg-white text-brand-700 hover:bg-brand-50"
              }`}
            >
              {seatCode}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SeatMap;
