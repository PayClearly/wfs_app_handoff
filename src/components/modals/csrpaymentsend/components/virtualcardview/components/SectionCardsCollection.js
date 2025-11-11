import React from 'react';
import Components from 'components';
import ReactPaginate from 'react-paginate';
import numeral from 'numeral';
import VendorFeeDetails from './VendorFeeDetails';

// Helper function for fee calculations
const calculateVendorFee = (amount, vendorFee, cardsLength) => ({
  netPayment: numeral(amount - vendorFee / cardsLength).format('$0.00'),
  serviceFee: numeral(vendorFee / cardsLength).format('$0.00'),
  totalPayment: numeral(amount).format('$0.00'),
});

const VendorCardDetails = React.memo(({
  card,
  cards,
  createdBy,
  index,
  loading,
  logo,
  privateCard,
  vendorFee,
}) => {
  const {
    netPayment,
    serviceFee,
    totalPayment,
  } = calculateVendorFee(card.amount, vendorFee, cards.length);

  return (
    <div className="w-100">
      <div className="card-header default-bg">
        Virtual Card {index + 1} of {cards.length} - for {numeral(card.amount).format('$0.00')}
      </div>
      <div className="card-body flex-center-column">
        {
          vendorFee && (
            <VendorFeeDetails
              netPayment={netPayment}
              serviceFee={serviceFee}
              totalPayment={totalPayment}
            />
          )
        }
        {!loading && privateCard && (
          <span>Card Number:&nbsp;<strong>{privateCard.cardNumber || 'Not Available'}</strong></span>
        )}
        <Components.virtualcard
          loading={loading}
          privateCardData={privateCard}
          createdBy={createdBy}
          logo={logo}
          showCopierTooltip
          cardType={privateCard?.cardType}
        />
      </div>
    </div>
  );
});

const CardsCollection = React.memo(({ cards, currentCard, handlePageChange }) => (
  <div className="card card-container pb-3">
    {cards[currentCard]}
    <ReactPaginate
      onPageChange={handlePageChange}
      pageRangeDisplayed={3}
      pageCount={cards.length}
      renderOnZeroPageCount={null}
      containerClassName="card-container"
      previousLabel="Previous"
      previousClassName="paginate_page previous"
      previousLinkClassName="paginate_button"
      nextLabel="Next"
      nextClassName="paginate_page next"
      nextLinkClassName="paginate_button"
      breakLabel={<span className="ellipsis">...</span>}
      breakClassName="paginate_page"
      pageLinkClassName="paginate_button"
      pageClassName="paginate_page"
      marginPagesDisplayed={1}
      activeClassName="current"
    />
  </div>
));

const SectionCardsCollection = React.memo(({
  accountId,
  accounts,
  currentCard,
  paymentStatus,
  privateVirtualCard,
  setCurrentCard,
  users,
}) => {
  const cards = paymentStatus?.funded?.vCards || [];
  const privateCards = privateVirtualCard?.data?.items || {};
  const logo = accounts?.data?.items?.[accountId]?.virtualCardLogo;
  const loading = privateVirtualCard?.status?.fetching;
  const createdBy = users?.[paymentStatus?._createdBy];
  const vendorFee = paymentStatus?.created?.fee || null;

  const handlePageChange = (event) => {
    setCurrentCard(event.selected);
  };

  if (loading) {
    return (
      <div className="card card-container pb-3 d-flex justify-content-center">
        <div className="card-header default-bg">Virtual Cards</div>
        <div className="card-body flex-center-column">
          <Components.spinner />
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return <div>No virtual cards available.</div>;
  }

  const CardComponentsArray = cards.map((card, index) => (
    <VendorCardDetails
      key={`card-${card.id}`}
      card={card}
      index={index}
      cards={cards}
      vendorFee={vendorFee}
      privateCard={privateCards[card.id]}
      logo={logo}
      createdBy={createdBy}
      loading={loading}
    />
  ));

  return <CardsCollection cards={CardComponentsArray} currentCard={currentCard} handlePageChange={handlePageChange} />;
});

export default SectionCardsCollection;
