
function Product({title,img}) {
  return (
    <div className=" relative flex items-center justify-center hover:scale-110 transition-all duration-400">
      <h1 className="absolute text-shadow-lg shadow-black drop-shadow-lg text-center  text-white font-bold text-2xl ">{title}</h1>
      <img src={img} className="  size-60 rounded-full " alt="KinderCake" />
    </div>
  );
}

export default Product;
