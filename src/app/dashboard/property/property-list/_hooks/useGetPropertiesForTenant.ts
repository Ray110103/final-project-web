import { PageableResponse, PaginationQueries } from "@/types/pagination";
import { Property } from "@/types/property";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface GetPropertiesForTenantQuery extends PaginationQueries {
  search?: string;
  category?: string;
  location?: string;
}

interface TenantPropertiesError {
  type: 'auth' | 'network' | 'server' | 'forbidden' | 'unknown';
  message: string;
  statusCode?: number;
  shouldRedirect?: boolean;
}

const useGetPropertiesForTenant = (queries?: GetPropertiesForTenantQuery) => {
  const router = useRouter();

  return useQuery<PageableResponse<Property>, TenantPropertiesError>({
    queryKey: ["tenantProperties", queries],
    queryFn: async () => {
      console.log("useGetPropertiesForTenant: Starting request with queries:", queries);
      
      try {
        // Clean and prepare parameters
        const params: Record<string, any> = {};
        if (queries) {
          Object.entries(queries).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params[key] = value;
            }
          });
        }

        console.log("useGetPropertiesForTenant: Making request with params:", params);

        const { data } = await axiosInstance.get<PageableResponse<Property>>(
          "/property/tenant/properties",
          { params }
        );

        console.log("useGetPropertiesForTenant: API response:", data);

        if (data.data.length === 0 && data.meta.total === 0) {
          console.log("useGetPropertiesForTenant: Tenant has no properties");
          return data; 
        }

        return data;

      } catch (error) {
        console.error("useGetPropertiesForTenant: API error:", error);
        
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const statusCode = axiosError.response.status;
          
          switch (statusCode) {
            case 401:
              // Redirect to login for unauthorized users
              setTimeout(() => {
                router.push('/login');
              }, 1000);
              
              throw {
                type: 'auth',
                message: 'Sesi Anda telah berakhir. Anda akan diarahkan ke halaman login.',
                statusCode: 401,
                shouldRedirect: true
              } as TenantPropertiesError;
              
            case 403:
              // Redirect to login for users without tenant role
              setTimeout(() => {
                router.push('/login');
              }, 1500);
              
              throw {
                type: 'forbidden',
                message: 'Anda tidak memiliki akses sebagai tenant. Silakan login dengan akun tenant yang valid.',
                statusCode: 403,
                shouldRedirect: true
              } as TenantPropertiesError;
              
            case 404:
              throw {
                type: 'server',
                message: 'Layanan properti tenant tidak tersedia. Silakan hubungi administrator.',
                statusCode: 404
              } as TenantPropertiesError;
              
            case 500:
              throw {
                type: 'server',
                message: 'Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.',
                statusCode: 500
              } as TenantPropertiesError;
              
            default:
              throw {
                type: 'server',
                message: `Terjadi kesalahan (${statusCode}). Silakan coba lagi.`,
                statusCode
              } as TenantPropertiesError;
          }
        } else if (axiosError.request) {
          throw {
            type: 'network',
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
          } as TenantPropertiesError;
        } else {
          throw {
            type: 'unknown',
            message: 'Terjadi kesalahan yang tidak diketahui. Silakan muat ulang halaman.',
          } as TenantPropertiesError;
        }
      }
    },
    enabled: true, // Query will run, axios interceptor handles auth
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      const tenantError = error as TenantPropertiesError;
      
      // Don't retry auth or forbidden errors (client errors)
      if (tenantError.type === 'auth' || tenantError.type === 'forbidden') {
        return false;
      }
      
      // Don't retry other 4xx errors
      if (tenantError.statusCode && tenantError.statusCode >= 400 && tenantError.statusCode < 500) {
        return false;
      }
      
      // Retry network and 5xx server errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export default useGetPropertiesForTenant;