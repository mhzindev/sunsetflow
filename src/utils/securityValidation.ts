
export const validateInput = (input: string, type: 'email' | 'text' | 'number' = 'text'): boolean => {
  if (!input || input.trim().length === 0) return false;
  
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input.trim());
    case 'number':
      return !isNaN(Number(input));
    case 'text':
      // Prevent basic XSS attempts
      const dangerousChars = /<script|javascript:|on\w+=/i;
      return !dangerousChars.test(input);
    default:
      return true;
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Limit length
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Add security validation for company isolation
export const validateCompanyAccess = (userCompanyId: string | null, dataCompanyId: string | null): boolean => {
  if (!userCompanyId || !dataCompanyId) return false;
  return userCompanyId === dataCompanyId;
};

// Get user's company ID from profile for security checks
export const getUserCompanyId = async (supabase: any, userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user company ID:', error);
      return null;
    }
    
    return data?.company_id || null;
  } catch (error) {
    console.error('Error in getUserCompanyId:', error);
    return null;
  }
};
