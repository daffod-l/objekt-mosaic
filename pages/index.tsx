import { useState, useRef, useEffect } from "react";
import NextImage from "next/image"; 
import allObjekts from "../data/allobjekts.json";
import specialClassObjekts from "../data/specialclassobjekts.json";

type RGB = { r: number; g: number; b: number };
type ObjektWithAvg = { image: string; avg: RGB };

const CLASSES = ["Special", "First", "Double", "Welcome", "Premier"] as const;
type ClassType = (typeof CLASSES)[number] | null;

export default function Home() {
  const [count, setCount] = useState(50);
  const [selectedClass, setSelectedClass] = useState<ClassType>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState(
    "No file chosen yet."
  );

  const [objektColors, setObjektColors] = useState<ObjektWithAvg[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let source: typeof allObjekts;

    if (selectedClass === "Special") {
      source = specialClassObjekts;
    } else {
      source = allObjekts;
    }

    const loadObjekts = async () => {
      const results: ObjektWithAvg[] = await Promise.all(
        source.map(
          (obj) =>
            new Promise<ObjektWithAvg>((resolve) => {
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.src = obj.image;
              img.onload = () =>
                resolve({ image: obj.image, avg: getAverageColor(img) });
            })
        )
      );
      setObjektColors(results);
    };

    loadObjekts();
  }, [selectedClass]);

  // preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = uploadedImage || "/defaultImage.jpg";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
    };
  }, [uploadedImage]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleGenerate = () => {
    const canvas = canvasRef.current;
    if (!canvas || objektColors.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = uploadedImage || "/defaultImage.jpg";

    img.onload = () => {
      const cols = count;
      const tileWidth = img.width / cols;
      const tileHeight = tileWidth * 1.5;
      const rows = Math.floor(img.height / tileHeight);

      canvas.width = img.width;
      canvas.height = rows * tileHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const tileCanvas = document.createElement("canvas");
          tileCanvas.width = tileWidth;
          tileCanvas.height = tileHeight;
          const tileCtx = tileCanvas.getContext("2d")!;
          tileCtx.drawImage(
            img,
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight,
            0,
            0,
            tileWidth,
            tileHeight
          );

          const imageData = tileCtx.getImageData(0, 0, tileWidth, tileHeight).data;
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
          }
          const avgTileColor: RGB = {
            r: r / (tileWidth * tileHeight),
            g: g / (tileWidth * tileHeight),
            b: b / (tileWidth * tileHeight),
          };

          const closestObjekt = findClosestObjekt(avgTileColor);

          const tileImg = new window.Image();
          tileImg.crossOrigin = "anonymous";
          tileImg.src = closestObjekt.image;
          tileImg.onload = () => {
            ctx.drawImage(tileImg, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
          };
        }
      }
    };
  };

  return (
    <div className="flex h-screen bg-white text-black">
      <div className="w-1/6 min-w-[200px] border-r border-gray-300 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold">Objekt Mosaic</h2>

        <div className="flex flex-col gap-2">
          <label className="font-bold">Upload Image</label>
          <label className="border border-black px-4 py-2 cursor-pointer text-center rounded hover:bg-gray-200 transition-colors duration-200">
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
            min={5}
            max={150}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-medium">Select Class</span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSelectedClass(null)}
              className={`mt-2 px-3 py-1 rounded border text-sm ${
                selectedClass === null
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-400 hover:bg-gray-200"
              }`}
            >
              All (Default)
            </button>
            {CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1 rounded border text-sm ${
                  selectedClass === cls
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-400 hover:bg-gray-200"
                }`}
              >
                {cls}
              </button>
            ))}
            
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
        >
          Generate Mosaic
        </button>

        <span className="font-medium italic text-gray-600">
          Note: Only All/SCOs are functioning (try the others at ur own risk/j)
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <canvas ref={canvasRef} className="border max-h-[90%] max-w-[90%]" />
      </div>
    </div>
  );

  // funcs
  function getAverageColor(img: HTMLImageElement): RGB {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    let r = 0, g = 0, b = 0;
    const pixelCount = img.width * img.height;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    return { r: r / pixelCount, g: g / pixelCount, b: b / pixelCount };
  }

  function colorDistance(c1: RGB, c2: RGB) {
    return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
  }

  function findClosestObjekt(avgColor: RGB) {
    let best = objektColors[0];
    let minDist = colorDistance(avgColor, best.avg);
    for (const obj of objektColors) {
      const dist = colorDistance(avgColor, obj.avg);
      if (dist < minDist) {
        minDist = dist;
        best = obj;
      }
    }
    return best;
  }
}
