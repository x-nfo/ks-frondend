import { Link } from "react-router";
import { ArrowLeft, Ruler } from "lucide-react";

export default function SizeGuide() {
    return (
        <div className="min-h-screen pt-40 md:pt-52 pb-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-karima-ink/40 hover:text-karima-brand transition-colors text-xs uppercase tracking-widest group"
                >
                    <ArrowLeft
                        size={16}
                        className="group-hover:-translate-x-1 transition-transform"
                    /> Back to Home
                </Link>
            </div>
            <div className="container mx-auto max-w-4xl px-6">
                <div className="text-center mb-16">
                    <span
                        className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-4"
                    >Fit & Measurements</span>
                    <h1
                        className="text-4xl md:text-5xl font-serif text-karima-brand italic mb-6"
                    >
                        Size Guide
                    </h1>
                    <p
                        className="text-karima-ink/60 font-light max-w-lg mx-auto leading-relaxed"
                    >
                        Use this chart to find your perfect fit. Our abayas are designed to be loose and modest.
                    </p>
                </div>

                <div className="overflow-x-auto mb-16 border border-karima-brand/10">
                    <table className="w-full text-center text-sm">
                        <thead className="bg-karima-brand/5 text-karima-brand uppercase tracking-widest font-medium">
                            <tr>
                                <th className="py-4 px-6 border-b border-karima-brand/10">Size</th>
                                <th className="py-4 px-6 border-b border-karima-brand/10">Bust (cm)</th>
                                <th className="py-4 px-6 border-b border-karima-brand/10">Waist (cm)</th>
                                <th className="py-4 px-6 border-b border-karima-brand/10">Hips (cm)</th>
                                <th className="py-4 px-6 border-b border-karima-brand/10">Length (cm)</th>
                            </tr>
                        </thead>
                        <tbody className="text-karima-ink/70 font-light">
                            <tr className="border-b border-karima-brand/5 hover:bg-stone-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-karima-brand">XS</td>
                                <td className="py-4 px-6">80-84</td>
                                <td className="py-4 px-6">64-68</td>
                                <td className="py-4 px-6">88-92</td>
                                <td className="py-4 px-6">135</td>
                            </tr>
                            <tr className="border-b border-karima-brand/5 hover:bg-stone-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-karima-brand">S</td>
                                <td className="py-4 px-6">84-88</td>
                                <td className="py-4 px-6">68-72</td>
                                <td className="py-4 px-6">92-96</td>
                                <td className="py-4 px-6">138</td>
                            </tr>
                            <tr className="border-b border-karima-brand/5 hover:bg-stone-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-karima-brand">M</td>
                                <td className="py-4 px-6">88-92</td>
                                <td className="py-4 px-6">72-76</td>
                                <td className="py-4 px-6">96-100</td>
                                <td className="py-4 px-6">140</td>
                            </tr>
                            <tr className="border-b border-karima-brand/5 hover:bg-stone-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-karima-brand">L</td>
                                <td className="py-4 px-6">92-96</td>
                                <td className="py-4 px-6">76-80</td>
                                <td className="py-4 px-6">100-104</td>
                                <td className="py-4 px-6">142</td>
                            </tr>
                            <tr className="hover:bg-stone-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-karima-brand">XL</td>
                                <td className="py-4 px-6">96-100</td>
                                <td className="py-4 px-6">80-84</td>
                                <td className="py-4 px-6">104-108</td>
                                <td className="py-4 px-6">145</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-karima-base/30 p-8 flex items-start gap-6 border border-karima-brand/5">
                    <Ruler size={32} strokeWidth={1} className="text-karima-gold shrink-0 mt-1" />
                    <div>
                        <h3 className="font-serif text-xl text-karima-brand italic mb-2">Measuring Tips</h3>
                        <ul className="text-karima-ink/70 font-light text-sm space-y-2 list-disc pl-4">
                            <li><strong>Bust:</strong> Measure around the fullest part of your bust.</li>
                            <li><strong>Waist:</strong> Measure around your natural waistline.</li>
                            <li><strong>Hips:</strong> Measure around the fullest part of your hips.</li>
                            <li><strong>Length:</strong> Measure from the highest point of your shoulder down to the floor.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
