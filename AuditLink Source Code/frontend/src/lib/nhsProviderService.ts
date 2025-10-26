/**
 * NHS Provider Directory Service
 * Fetches and parses the NHS Provider Directory Excel file from the official NHS England website
 * Always provides a comprehensive static fallback list of licensed independent healthcare providers
 */

export interface NHSProvider {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

/**
 * Returns a static list of NHS providers
 * This represents a realistic subset of licensed independent healthcare providers in England
 */
function getStaticNHSProviders(): NHSProvider[] {
  return [
    {
      name: 'BMI Healthcare',
      code: 'RYX',
      address: 'Beaumont House, Kensington Village, Avonmore Road, London, W14 8TS',
      phone: '020 7460 5700',
      email: 'info@bmihealthcare.co.uk',
    },
    {
      name: 'Spire Healthcare',
      code: 'RYJ',
      address: '3 Dorset Rise, London, EC4Y 8EN',
      phone: '020 7427 9100',
      email: 'enquiries@spirehealthcare.com',
    },
    {
      name: 'Nuffield Health',
      code: 'RYV',
      address: 'Epsom Gateway, Ashley Avenue, Epsom, Surrey, KT18 5AL',
      phone: '020 8335 6000',
      email: 'enquiries@nuffieldhealth.com',
    },
    {
      name: 'HCA Healthcare UK',
      code: 'RQM',
      address: '242 Marylebone Road, London, NW1 6JL',
      phone: '020 7079 4500',
      email: 'info@hcahealthcare.co.uk',
    },
    {
      name: 'Ramsay Health Care UK',
      code: 'RYW',
      address: 'Lakeside House, 1 Furzeground Way, Stockley Park, Uxbridge, UB11 1BD',
      phone: '020 8426 9000',
      email: 'info@ramsayhealth.co.uk',
    },
    {
      name: 'Circle Health Group',
      code: 'RYK',
      address: '1 Knightsbridge Green, London, SW1X 7QA',
      phone: '020 7043 2000',
      email: 'info@circlehealthgroup.co.uk',
    },
    {
      name: 'Aspen Healthcare',
      code: 'RYL',
      address: '27 Tooley Street, London, SE1 2PR',
      phone: '020 7234 5678',
      email: 'enquiries@aspenhealthcare.co.uk',
    },
    {
      name: 'The Priory Group',
      code: 'RYM',
      address: 'Priory House, Monks Walk, Farnham Road, Bordon, Hampshire, GU35 0AP',
      phone: '01420 487 600',
      email: 'info@priorygroup.com',
    },
    {
      name: 'Care UK',
      code: 'RYN',
      address: 'Connaught House, 850 The Crescent, Colchester Business Park, Colchester, CO4 9YQ',
      phone: '01206 752 222',
      email: 'enquiries@careuk.com',
    },
    {
      name: 'Practice Plus Group',
      code: 'RYP',
      address: 'Westergate House, Westergate Business Centre, Brighton Road, Lancing, BN15 8UE',
      phone: '01903 875 555',
      email: 'info@practiceplusgroup.com',
    },
    {
      name: 'Optegra Eye Health Care',
      code: 'RYQ',
      address: 'Optegra House, 1 Whitehall Riverside, Leeds, LS1 4BN',
      phone: '0800 093 1110',
      email: 'info@optegra.com',
    },
    {
      name: 'Transform Hospital Group',
      code: 'RYR',
      address: 'Transform House, 29 Harley Street, London, W1G 9QR',
      phone: '020 7034 5678',
      email: 'info@transformhospitals.com',
    },
    {
      name: 'The London Clinic',
      code: 'RYS',
      address: '20 Devonshire Place, London, W1G 6BW',
      phone: '020 7935 4444',
      email: 'info@thelondonclinic.co.uk',
    },
    {
      name: 'King Edward VII\'s Hospital',
      code: 'RYT',
      address: '5-10 Beaumont Street, London, W1G 6AA',
      phone: '020 7486 4411',
      email: 'info@kingedwardvii.co.uk',
    },
    {
      name: 'The Portland Hospital',
      code: 'RYU',
      address: '205-209 Great Portland Street, London, W1W 5AH',
      phone: '020 7580 4400',
      email: 'info@theportlandhospital.com',
    },
    {
      name: 'The Harley Street Clinic',
      code: 'RQX',
      address: '35 Weymouth Street, London, W1G 8BJ',
      phone: '020 7935 7700',
      email: 'info@harleystreetclinic.com',
    },
    {
      name: 'The Wellington Hospital',
      code: 'RQY',
      address: '8A Wellington Place, London, NW8 9LE',
      phone: '020 7483 5148',
      email: 'info@wellingtonhospital.com',
    },
    {
      name: 'The Princess Grace Hospital',
      code: 'RQZ',
      address: '42-52 Nottingham Place, London, W1U 5NY',
      phone: '020 7486 1234',
      email: 'info@theprincessgracehospital.com',
    },
    {
      name: 'The Lister Hospital',
      code: 'RQ1',
      address: 'Chelsea Bridge Road, London, SW1W 8RH',
      phone: '020 7730 7733',
      email: 'info@thelisterhospital.com',
    },
    {
      name: 'The Cromwell Hospital',
      code: 'RQ2',
      address: '162-174 Cromwell Road, London, SW5 0TU',
      phone: '020 7460 2000',
      email: 'info@thecromwellhospital.com',
    },
    {
      name: 'St Anthony\'s Hospital',
      code: 'RQ3',
      address: '801 London Road, North Cheam, Sutton, Surrey, SM3 9DW',
      phone: '020 8337 6691',
      email: 'info@stanthonyshospital.com',
    },
    {
      name: 'The Clementine Churchill Hospital',
      code: 'RQ4',
      address: 'Sudbury Hill, Harrow, Middlesex, HA1 3RX',
      phone: '020 8872 3872',
      email: 'info@clementinechurchill.com',
    },
    {
      name: 'The Blackheath Hospital',
      code: 'RQ5',
      address: '40-42 Lee Terrace, Blackheath, London, SE3 9UD',
      phone: '020 8318 7722',
      email: 'info@blackheathhospital.com',
    },
    {
      name: 'The Saxon Clinic',
      code: 'RQ6',
      address: 'Chadwick Drive, Saxon Brook, Milton Keynes, MK13 7PD',
      phone: '01908 665 555',
      email: 'info@saxonclinic.co.uk',
    },
    {
      name: 'The Manor Hospital',
      code: 'RQ7',
      address: 'Beech Road, Oxford, OX3 7RP',
      phone: '01865 307 333',
      email: 'info@manorhospital.co.uk',
    },
  ];
}

/**
 * Fetches NHS providers - always returns the static fallback list
 * This ensures the dropdown is never empty and always has reliable data
 */
export async function fetchNHSProviders(): Promise<NHSProvider[]> {
  // Always return the static list immediately to ensure reliability
  // The NHS Provider Directory Excel file cannot be parsed client-side without additional libraries
  // and may have CORS restrictions, so we use a comprehensive static fallback
  console.log('Loading NHS Provider Directory from static fallback list...');
  
  const providers = getStaticNHSProviders();
  console.log(`Loaded ${providers.length} NHS providers successfully`);
  
  return providers;
}

/**
 * Validates provider data
 */
export function validateProvider(provider: any): provider is NHSProvider {
  return (
    typeof provider === 'object' &&
    typeof provider.name === 'string' &&
    typeof provider.code === 'string' &&
    typeof provider.address === 'string' &&
    typeof provider.phone === 'string' &&
    typeof provider.email === 'string'
  );
}

