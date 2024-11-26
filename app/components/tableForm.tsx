import InputCustom from "./form/input";

interface TableForm {
  header: string[];
  data: Record<string, string | number>[];
  type: "Sale" | "Ticket";
  handleAmount: (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    name: string,
    key: "fresh" | "whithered" | "price"
  ) => void;
}

export default function tableForm({
  header,
  data,
  type,
  handleAmount,
}: TableForm) {
  return (
    <div className="rounded-lg overflow-hidden my-5 shadow-sm">
      <div className="bg-white px-2 pt-1 flex items-center justify-around text-md font-medium text-neutral-600 h-12 border-b hover:bg-neutral-200 transition">
        {header.map((item, index) => (
          <span key={index} className="w-56">
            {item}
          </span>
        ))}
      </div>
      {type === "Sale" ? (
        <></>
      ) : (
        <>
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white hover:bg-neutral-50 flex items-center justify-around border-b py-2 px-2 hover:shadow-inner"
            >
              <div className="w-56">
                <label
                  htmlFor={`flower-${item.id}`}
                  className="text-md block w-fit shadow-lg text-neutral-900 font-semibold hover:cursor-pointer rounded-sm bg-yellow-200 p-1 ring-4 ring-yellow-100 border-2 border-yellow-300"
                >
                  {item.name}
                </label>
              </div>
              <InputCustom
                color="blue"
                name={`flower-${item.id}`}
                id={`flower-${item.id}`}
                type="number"
                width="w-56"
                placeholder="0"
                onChange={(e) =>
                  handleAmount(
                    e,
                    item.id as number,
                    item.name as string,
                    "fresh"
                  )
                }
              />
              <InputCustom
                color="amber"
                type="number"
                width="w-56"
                placeholder="0"
                onChange={(e) =>
                  handleAmount(
                    e,
                    item.id as number,
                    item.name as string,
                    "whithered"
                  )
                }
              />
              <InputCustom
                color="green"
                type="number"
                width="w-56"
                placeholder="0"
                onChange={(e) =>
                  handleAmount(
                    e,
                    item.id as number,
                    item.name as string,
                    "price"
                  )
                }
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
