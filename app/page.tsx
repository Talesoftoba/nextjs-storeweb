import Image from "next/image";

export default function HomePage() {
  return (
    <div className=" w-full h-full flex items-center justify-center overflow-hidden">
      
      <Image
        src="/background.jpg"
        alt="Background"
        fill
        priority
        className="object-cover -z-10"
      />

      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="max-w-3xl mx-6 text-center space-y-6 p-10 bg-white/10 backdrop-blur-md border border-red-400 rounded-xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          MarketStore
        </h2>

        <p className="text-xl text-white/90">
          Use the dashboard to access our products
        </p>

        <p className="text-base text-white/80 leading-relaxed">
          We pride ourselves on offering carefully selected products that bring
          style, comfort, and value to your everyday life. Whether you’re shopping
          for essentials or something special, our commitment is to provide you
          with a seamless experience, friendly service, and items you’ll truly
          love. Step inside and discover a store built around you..
        </p>
      </div>
    </div>
  );
}
