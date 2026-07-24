export default function CoomingSoon() {
    return(
        <div className="w-full h-screen flex md:flex-col justify-center items-center">
            <div className="mb-10 flex flex-col justify-center items-center">
                <h1 className="text-3xl font-bold text-slate-800">Oops!</h1>
                <p className="text-5xl text-slate-700 mt-20">This feature is coming <span className="font-bold text-slate-900">soon!</span></p>
                <span className="text-slate-500">Team IT dcci lagi ngembangin fitur nya nih, ditunggu yaaa.</span>
            </div>
            <div className="flex justify-center items-center">
                {/* Add any additional content or elements here */}
                <input type="text" className="border border-slate-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your text here..." />
            </div>
        </div>
    )
}