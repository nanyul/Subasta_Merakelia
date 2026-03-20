import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export const CustomInputField = ({ label, error, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="mb-4">
            <Label className="block mb-1 text-sm font-medium">{label}</Label>
            <Input 
                {...props}  
                className={cn(
                    "w-full rounded-xl border shadow-sm text-base",
                    "placeholder:text-gray-400 bg-transparent hover:bg-transparent transition-all duration-200"
                )}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    props.onBlur?.(e);
                }}
                style={{
                    borderColor: error ? '#ECB44D' : isFocused ? '#ECB44D' : '#6FB8E6',
                    boxShadow: isFocused ? '0 0 0 2px #ECB44D' : error ? '0 0 0 2px #ECB44D' : 'none'
                }}
            />
            {/* Mensaje de error */}
            {error && (
                <p className="flex items-center gap-1 mt-1 text-sm" style={{ color: '#ECB44D' }}>
                    <AlertCircle className="h-4 w-4" style={{ color: '#ECB44D' }} />
                    {error}
                </p>
            )}
        </div>
    );
};

CustomInputField.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
};