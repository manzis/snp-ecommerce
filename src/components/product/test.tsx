import React from 'react';

// --- TYPES ---
interface ReviewData {
  id: string | number;
  bgColor: string;
  textColor: string;
  subTextColor: string;
  checkBgColor: string;
  verifiedColor: string;
}

// --- MOCK DATA ---
const REVIEWS: ReviewData[] =[
  { id: 1, bgColor: '#FFEA00', textColor: '#242424', subTextColor: '#242424', checkBgColor: '#3F9733', verifiedColor: '#3F9733' },
  { id: 2, bgColor: 'white',       textColor: '#242424', subTextColor: '#242424', checkBgColor: '#3F9733', verifiedColor: '#3F9733' },
  { id: 3, bgColor: '#3F9733', textColor: 'white',       subTextColor: '#F9F9F9', checkBgColor: 'white',       verifiedColor: 'white' },
  { id: 4, bgColor: '#335097', textColor: 'white',       subTextColor: '#F9F9F9', checkBgColor: 'white',       verifiedColor: 'white' },
];

// --- SUB-COMPONENT: REUSABLE REVIEW CARD ---
const ReviewCard = ({ data }: { data: ReviewData }) => {
  return (
    <div className="ReviewCard" style={{ width: 225, height: 290, padding: 2, position: 'relative', background: data.bgColor, boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.10), 0px 1px 2px -1px rgba(16, 24, 40, 0.10)', borderRadius: 8, outline: '2px white solid', outlineOffset: '-2px', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
      <img className="ReviewImage" style={{ alignSelf: 'stretch', flex: '1 1 0', borderRadius: 6, objectFit: 'cover' }} src="https://placehold.co/221x178" alt="Review" />
      
      <div className="Frame61" style={{ alignSelf: 'stretch', paddingTop: 12, paddingBottom: 8, paddingLeft: 12, paddingRight: 12, borderRadius: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 6, display: 'flex' }}>
        <div className="Frame63" style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex' }}>
          <div className="ReviewText" style={{ alignSelf: 'stretch', textAlign: 'center', color: data.textColor, fontSize: 14, fontFamily: 'DK Jalebi', fontWeight: '400', lineHeight: '18px', letterSpacing: 0.10, wordWrap: 'break-word' }}>
            “Loved the Purchase from Supplyment Nepal, will purchase again”
          </div>
          
          <div className="Frame80" style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex' }}>
            <div className="Frame78" style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 2, display: 'flex' }}>
              <div className="Frame64" style={{ justifyContent: 'center', alignItems: 'center', gap: 6, display: 'inline-flex' }}>
                <div className="Frame60" style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
                  <div className="AuthorInfo" style={{ alignSelf: 'stretch', textAlign: 'center', color: data.subTextColor, fontSize: 10, fontFamily: 'Titillium Web', fontWeight: '400', lineHeight: '12px', letterSpacing: 0.10, wordWrap: 'break-word' }}>
                    Manjish Upadhaya | Athelete
                  </div>
                </div>
              </div>
            </div>
            
            <div className="Frame79" style={{ justifyContent: 'center', alignItems: 'center', gap: 2, display: 'inline-flex' }}>
              <div className="Checkcircle" style={{ width: 10, height: 10, position: 'relative', overflow: 'hidden' }}>
                <div className="Vector" style={{ width: 8.13, height: 8.13, left: 0.94, top: 0.94, position: 'absolute', background: data.checkBgColor, borderRadius: '50%' }} />
              </div>
              <div className="VerifiedBuyer" style={{ color: data.verifiedColor, fontSize: 8, fontFamily: 'Titillium Web', fontWeight: '600', lineHeight: '7px', letterSpacing: 0.10, wordWrap: 'break-word' }}>
                Verified Buyer
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Rating Badge */}
      <div className="Frame77" style={{ padding: 4, right: 8, top: 8, position: 'absolute', background: 'white', borderRadius: 4, justifyContent: 'center', alignItems: 'center', gap: 2, display: 'inline-flex' }}>
        <div className="Star" style={{ width: 14, height: 14, position: 'relative', overflow: 'hidden' }}>
          <div className="Vector" style={{ width: 12.24, height: 11.81, left: 0.88, top: 0.88, position: 'absolute', background: '#F4B300', boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.04)' }} />
        </div>
        <div className="RatingText">
          <span style={{ color: '#242424', fontSize: 12, fontFamily: 'Titillium Web', fontWeight: '600', wordWrap: 'break-word' }}>4.3</span>
          <span style={{ color: '#242424', fontSize: 12, fontFamily: 'Titillium Web', fontWeight: '400', wordWrap: 'break-word' }}>/5.0</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN EXPORT COMPONENT ---
export default function RatingAndReviews() {
  return (
    <div className="DeliveryDetails" style={{ width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex' }}>
      
      {/* HEADER SECTION */}
      <div className="Frame76" style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
        <div className="RatingAndReviewsTitle" style={{ color: '#242424', fontSize: 20, fontFamily: 'Titillium Web', fontWeight: '600', lineHeight: '18px', wordWrap: 'break-word' }}>
          Rating and Reviews
        </div>
        <button className="IconButton" style={{ padding: 8, background: '#FAFBFC', border: 'none', cursor: 'pointer', boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.04)', overflow: 'hidden', borderRadius: 6, outline: '1px var(--Stroke-Light-Base, #EAEBF0) solid', outlineOffset: '-0.50px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <div className="Caretdown" style={{ width: 16, height: 16, position: 'relative', overflow: 'hidden' }}>
            <div className="Vector" style={{ width: 11, height: 6, left: 2.50, top: 5.50, position: 'absolute', background: 'black' }} />
          </div>
        </button>
      </div>

      {/* HORIZONTAL SCROLL CARDS SECTION */}
      <div className="Frame68" style={{  flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'flex' }}>
        <div className="Frame65" style={{  justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex', overflowX: 'auto', paddingBottom: 4 }}>
          
          {/* Map through data to render Review Cards */}
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} data={review} />
          ))}

          {/* VIEW ALL BUTTON */}
          <button className="Button" style={{ width: 84, minWidth: 84, alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: '#FAFBFC', border: 'none', cursor: 'pointer', boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.04)', overflow: 'hidden', borderRadius: 6, outline: '1px var(--Stroke-Light-Base, #EAEBF0) solid', outlineOffset: '-0.50px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6, display: 'inline-flex' }}>
            <div className="Text" style={{ color: '#252525', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', lineHeight: '20px', letterSpacing: 0.10, wordWrap: 'break-word' }}>
              View all
            </div>
            <div className="Imagessquare" style={{ width: 26, height: 27, position: 'relative', overflow: 'hidden' }}>
              <div className="Vector" style={{ width: 19.50, height: 20.25, left: 3.25, top: 3.38, position: 'absolute', background: '#454545' }} />
            </div>
          </button>
        </div>
      </div>

      {/* POST REVIEW BUTTON */}
      <div className="Frame81" style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
        <button className="Button" style={{ width: '100%', alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, position: 'relative', background: 'white', border: 'none', cursor: 'pointer', boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.04)', overflow: 'hidden', borderRadius: 6, outline: '1px var(--Stroke-Light-Base, #EAEBF0) solid', outlineOffset: '-0.50px', justifyContent: 'center', alignItems: 'center', gap: 6, display: 'inline-flex' }}>
          <div className="Pencilsimpleline" style={{ width: 20, height: 20, position: 'relative', overflow: 'hidden' }}>
            <div className="Vector" style={{ width: 15.63, height: 15.62, left: 2.50, top: 1.88, position: 'absolute', background: '#242424' }} />
          </div>
          <div className="Text" style={{ color: '#242424', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', lineHeight: '20px', letterSpacing: 0.10, wordWrap: 'break-word' }}>
            Post your Review
          </div>
          <div className="EssentialsInformationCircle" style={{ width: 18, height: 18, right: 12, top: 9, position: 'absolute' }}>
            <div className="Icon" style={{ width: 15, height: 15, left: 1.50, top: 1.50, position: 'absolute', outline: '1.50px #575757 solid', outlineOffset: '-0.75px', borderRadius: '50%' }} />
          </div>
        </button>
      </div>

    </div>
  );
}
