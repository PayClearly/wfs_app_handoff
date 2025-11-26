const Card = `{
  cardHolderName,
  cardNumber,
  cardStock,
  cardType,
  customerName,
  customerNumber,
  expirationDate,
  status,
  tailNumber
}`;

const Service = `{
  comments,
  providerName,
  status,
  type
}`;

const FlightLeg = `{
  faa,
  iata,
  icao
}`;

const Address = `{
  addressLine1,
  addressLine2,
  city,
  country,
  state,
  zipcode
}`;

const DailyOperationsSchedule = `{
  datesScheduleType,
  dayOfWeek,
  endDate,
  endTime,
  hoursScheduleType,
  scheduleType,
  startDate,
  startTime
}`;

const CommunicationDetail = `{
  contact,
  preference
}`;

const FacilityCommunications = `{
  AFTN ${CommunicationDetail},
  ARINC ${CommunicationDetail},
  cellPhone ${CommunicationDetail},
  email ${CommunicationDetail},
  fax ${CommunicationDetail},
  pager ${CommunicationDetail},
  phone ${CommunicationDetail},
  SITA ${CommunicationDetail},
  telex ${CommunicationDetail},
  unicom ${CommunicationDetail},
  web ${CommunicationDetail}
}`;

const FacilityDetails = `{
  acceptedAviationCards,
  acceptedCreditCards,
  aircraftServices,
  pilotServices,
  rentalCarServices
}`;

const FacilityVendor = `{
  locationCode,
  vendorId,
  vendorSiteId
}`;

const Facility = `{
  address ${Address},
  airportName,
  createdBy,
  createdOn,
  dailyOperationsSchedules ${DailyOperationsSchedule},
  directions,
  faaId,
  facilityComments,
  facilityCommunications ${FacilityCommunications},
  facilityDetails ${FacilityDetails},
  facilityInternalComments,
  facilityName,
  facilityType,
  facilityTypeCode,
  facilityVendors ${FacilityVendor},
  fuelWeighting,
  iataCode,
  icaoCode,
  id,
  lastModifiedBy,
  lastModifiedOn,
  latitude,
  latitudeDms,
  longitude,
  longitudeDms,
  region,
  smallAircraftPriority,
  status,
  website
}`;

const Airport = `{
  airportName,
  icao,
}`;

const AirportWithLocation = `{
  airportName,
  icao,
  latitudeDec,
  longitudeDec
}`;

const PointDetailedSummary = `{
  avcardPoints,
  contractFuelPoints,
  mastercardPoints,
  otherPoints,
  tripSupportPoints
}`;

const PointSummary = `{
  pointBalance,
  pointDetails ${PointDetailedSummary},
}`;

const MemberRewards = `{
  firstName,
  lastName,
  memberNumber,
  memberTier,
  memberType,
  pointSummary ${PointSummary},
  resourceId
}`;

const CustomerRewards = `{
  companyName,
  customerTier,
  pointSummary ${PointSummary},
  tierExpirationDate
}`;

const OFA = `{
  contractEndDate,
  contractStartDate,
  customerName,
  domIntl,
  fboName,
  flightNumber,
  flightType,
  locationDetails {
    icao
  },
  productName,
  referenceNumber,
  specialInstructions,
  status
}`;

const LogisticsServices = `{
  providerName,
  comments,
  status,
  type
}`;

const LegDetails = `{
  legNumber,
  tailNumber,
  status,
  departAirportLocal,
  departAirportLocalTimeZoneAbbr,
  arriveAirportLocal,
  arriveAirportLocalTimeZoneAbbr,
  departUtc,
  arriveUtc,
  fromFlightLeg {
    icao
  },
  toFlightLeg {
    icao
  },
  departLogisticsServices ${LogisticsServices},
  arrivalLogisticsServices ${LogisticsServices}
}`;

const TripDetail = `{
  tripNumber,
  tripCategory,
  state,
  status,
  startDate,
  endDate,
  origin {
    icao
  },
  destination {
    icao
  },
  legDetails ${LegDetails}
}`;

const SO = `{
  destinationIcao,
  domesticIntl,
  customerName,
  fboName,
  orderNumber,
  orderStatus,
  productDescription,
  productName,
  quantity,
  uom,
  upliftDate
}`;

const DocumentDetails = `{
  date,
  documentType,
  fboName,
  icao,
  paymentType
}`;

const Document = `{
  documentId,
  documentName,
  resourceId,
  documentDetails ${DocumentDetails}
}`;

const Tail = `{
  tailNumber
}`;

module.exports = {
  Address,
  Airport,
  AirportWithLocation,
  DailyOperationsSchedule,
  Card,
  CustomerRewards,
  Document,
  Facility,
  FlightLeg,
  LegDetails,
  MemberRewards,
  OFA,
  Service,
  SO,
  Tail,
  TripDetail,
};
