import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [count, setCount] = useState(50);
  const [specificMember, setSpecificMember] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("No file chosen yet");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="flex h-screen bg-white text-black">
      <div className="w-1/6 min-w-[200px] border-r border-gray-300 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold">Objekt Mosaic</h2>

        <div className="flex flex-col gap-2">
          <label className="font-bold">Upload Image</label>

          <label className="border border-black px-4 py-2 cursor-pointer text-center rounded">
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-600 mt-1">{fileName}</span>
        </div>

        <span className="font-bold">Customise</span>

        <div className="flex flex-col gap-2">
          <label className="font-medium">Count: {count}</label>
          <input
            type="range"
            min={10}
            max={200}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Select Members</span>
          <button
            onClick={() => setSpecificMember(!specificMember)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              specificMember ? "bg-black" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                specificMember ? "translate-x-6" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>
        {specificMember && (
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            [member selection UI placeholder]
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Image
          src={uploadedImage || "/defaultImage.jpg"}
          alt="uploaded or default"
          width={600}
          height={600}
          className="object-contain max-h-[90%] max-w-[90%] border"
        />
      </div>
    </div>
  );
}
