import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Send, RotateCcw, MapPin, Calendar, Weight, CircleDollarSign } from 'lucide-react';

export default function CreateLoadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bidId: 'BF-BID-2026-001',
    fromLocation: '',
    toLocation: '',
    dispatchDate: '',
    tonnes: '',
    costPerTonne: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate a random Bid ID on mount
  useEffect(() => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({ ...prev, bidId: `BF-BID-2026-${randomNum}` }));
  }, []);

  const bidAmount = 
    (parseFloat(formData.tonnes) || 0) * (parseFloat(formData.costPerTonne) || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fromLocation.trim()) newErrors.fromLocation = 'From Location is required';
    if (!formData.toLocation.trim()) newErrors.toLocation = 'To Location is required';
    if (!formData.dispatchDate) newErrors.dispatchDate = 'Dispatch Date is required';
    if (!formData.tonnes || parseFloat(formData.tonnes) <= 0) newErrors.tonnes = 'Enter a valid number of tonnes';
    if (!formData.costPerTonne || parseFloat(formData.costPerTonne) <= 0) newErrors.costPerTonne = 'Enter a valid cost per tonne';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Load created successfully.",
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
      // Optionally navigate back or reset form
      // navigate('/loads');
      handleReset();
    }, 1500);
  };

  const handleReset = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      bidId: `BF-BID-2026-${randomNum}`,
      fromLocation: '',
      toLocation: '',
      dispatchDate: '',
      tonnes: '',
      costPerTonne: ''
    });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full w-10 h-10 border-gray-200 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Load</h1>
          <p className="text-sm text-gray-500">Create and publish a new transportation bid.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-lg bg-white overflow-hidden rounded-2xl">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
            <CardTitle className="text-lg font-semibold text-gray-800">Bid Information</CardTitle>
            <CardDescription>Fill in the details below to generate a new load requirement.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bid ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Bid ID
                  </label>
                  <Input 
                    name="bidId"
                    value={formData.bidId}
                    disabled
                    className="bg-gray-50 font-mono text-gray-500 border-gray-200"
                  />
                  <p className="text-xs text-gray-400">Auto-generated system ID</p>
                </div>

                {/* Dispatch Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Dispatch Date <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="date"
                    name="dispatchDate"
                    value={formData.dispatchDate}
                    onChange={handleChange}
                    className={`transition-all duration-200 ${errors.dispatchDate ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                  />
                  {errors.dispatchDate && <p className="text-xs text-red-500 animate-in fade-in">{errors.dispatchDate}</p>}
                </div>

                {/* From Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    From Location <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    placeholder="e.g., Hyderabad"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    className={`transition-all duration-200 ${errors.fromLocation ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                  />
                  {errors.fromLocation && <p className="text-xs text-red-500 animate-in fade-in">{errors.fromLocation}</p>}
                </div>

                {/* To Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    To Location <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    placeholder="e.g., Vijayawada"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    className={`transition-all duration-200 ${errors.toLocation ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                  />
                  {errors.toLocation && <p className="text-xs text-red-500 animate-in fade-in">{errors.toLocation}</p>}
                </div>

                {/* Number of Tonnes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Weight className="w-4 h-4 text-gray-400" />
                    Number of Tonnes <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="number"
                    placeholder="e.g., 20"
                    name="tonnes"
                    value={formData.tonnes}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`transition-all duration-200 ${errors.tonnes ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                  />
                  {errors.tonnes && <p className="text-xs text-red-500 animate-in fade-in">{errors.tonnes}</p>}
                </div>

                {/* Cost Per Tonne */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-gray-400" />
                    Cost Per Tonne (₹) <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="number"
                    placeholder="e.g., 2100"
                    name="costPerTonne"
                    value={formData.costPerTonne}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`transition-all duration-200 ${errors.costPerTonne ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                  />
                  {errors.costPerTonne && <p className="text-xs text-red-500 animate-in fade-in">{errors.costPerTonne}</p>}
                </div>

              </div>

              {/* Bid Amount Highlight */}
              <div className="mt-8 bg-green-50/50 rounded-xl p-6 border border-green-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-green-800">Total Bid Amount</h3>
                  <p className="text-xs text-green-600/80 mt-1">Auto-calculated based on tonnes and cost</p>
                </div>
                <div className="text-3xl font-bold text-green-700 font-mono tracking-tight">
                  ₹ {bidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 mt-8">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-2.5 h-auto transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Load...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Load
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={isLoading}
                  className="w-full sm:w-auto font-medium px-8 py-2.5 h-auto border-gray-200 hover:bg-gray-50 text-gray-600 transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
