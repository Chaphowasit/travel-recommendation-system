import React, { useState } from 'react';
import { Box, CssBaseline, Grid } from '@mui/material';
import Chat from './views/Chat';
import Suggestion from './views/Suggestion';

const App: React.FC = () => {
    // Sample data for foodAndDrinks, attractions, and hotels
    const foodAndDrinks = [
        {
            "foodAndDrink_name": "Kin Dee Restaurant",
            "about_and_tags": [
                "Kin Dee is a small, local, standalone hideaway family restaurant at Mai Khao run by 2008 Thailand's culinary champion and her sister. We serve local Phuket cuisine, live seafood, ancient Thai cuisine is just added on the menu. Vegetarian, kid menus, cocktails, Thai wine, main produce from the village where Kin Dee located and Phuket area. Open from 1030 hrs - 2200 hrs. 15 Minute drive from Phuket airport. Under 5 min to drive from Renaissance, Sala, JW Marriott, Anantara villa, Anantara vacation club, Marriott Mai Khao. Around 20 mins to drive from Aleenta, Mai Khao dream Natai.",
                "$5.00 – $20.00",
                "Thai",
                "Vegetarian Friendly, Vegan Options, Gluten Free Options",
                "Lunch, Dinner, Drinks",
                "Delivery, Takeout, Reservations, Outdoor Seating, Seating, Parking Available, Street Parking, Highchairs Available, Serves Alcohol, Full Bar, Wine and Beer, Accepts American Express, Accepts Mastercard, Accepts Visa, Digital Payments, Free Wifi, Accepts Credit Cards, Table Service, BYOB"
            ],
            "latitude": 8.175832,
            "longitude": 98.30173,
            "start_time": "10:30 AM",
            "end_time": "10:00 PM",
            "reviews": [
                "Kin Dee (Eat Well) was recommended by my sister and we were not disappointed, and we too will continue to spread the word. \nThe restaurant is hidden down a rather small side road (All taxis seem to know where this place is located). Kin Dee itself is rather secluded and surrounded by greenery.\nThe rustic red brick building is pleasantly airy with open walls with beautiful orchids hanging everywhere. There is also no air conditioning but fans are scattered along the walls.\nThe food quality was delicious and filling and prices are beyond fair.\nThe welcoming atmosphere created by the three young lads, who did the most serving was impressive.\nKin Dee certainly lives up to it's name.\nOur only gripe is the restrooms, which are located down a steep slop and it's very difficult to navigate in the dark.\nWe returned again twice.",
                "This is our first time eating at Kin Dee Restaurant. Mr. Win provided genuinely amazing service. The cuisine was also excellent, but the mango salad and green curry particularly impressed us.",
                "Great authentic Thai food with quick service. The food came out very fast, and the service was excellent. Credit card payments are accepted, which is convenient. The only downside was the presence of mosquitoes and bugs.",
                "Kin Dee was absolutely superb. Definitely the best restaurant where we had dinner at whilst here in Phuket. Thank you, Tripadvisor for this suggestion.",
                "The restaurant serves super delicious food. Everything was top notch but sea food such as clams was particularly exquisite. The best fish in tamarind sauce I have ever tried in Thailand so far. Excellent service and atmosphere too. Spacious interior. Good selection of wine. Perfect place for dinner.",
                "Great food at a more authentic Thai restaurant. Staff and variety of food and drink is very good indeed. Not to mention the sensible prices compared to the hotel restaurants.",
                "We had a really delicious meal here. We were recommended thus restaurant by our hotel and it did not disappoint, we'd definitely recommend a visit if you like traditional Thai food.",
                "This restaurant is great not only for food but also has a very nice seating outside, full of orchids of different kinds. We were ordering delivery lunches from there - Staying at JW Marriott, it was much cheaper than to eat at the hotel. Delivery over 500 baht is for free, they deliver to you security gate, send the menu and confirm the bill over whatsapp. \nFinally we wanted to see the place itself as well, and we were not disappointed. Totally worth the taxi fare from the hotel - we went there for dinner two evenings - what an amazing food. The owner greeted us as \"old friends\" due to our lunch orders ;).",
                "5 out of 5 for the food and the service. The food was delicious and portions generous.  The winged bean salad was an excellent starter and the beef stir fry with chilli garlic and holy basil a perfect main course . Recommended if you are near Mai Khao .",
                "We were recommended this restaurant by several people. We went with the whole family and everybody was very impressed by the restaurant, the food and the service. This family run restaurant is spacious and very nicely decorated. The value for money is amazing and we have added it to our ¨go to list¨for all our upcoming Phuket holidays.",
                "Ordered delivery from Kin Dee as we usually did in all our previous meals. Some tips and observations:\n- delivery is free for orders more than 500baht. \n- delivery process to JW Marriott was very smooth. They ask for your last name and room number and know the suitable back gates. Before delivery they call to let you know that the food is on its way (in 5 mins)\n- pre-orders for a specific time is possible! We timed our evening meal for after the happy hours and late afternoon swim and pre-ordered it before. Piece of cake!\n- restaurant website is tricky. All of us kept trying to get to the website and online menu. The links all lead you elsewhere. I’ve attached the menu as photos for reference. When all else fails, give them a call. \n- orders can be done on verbally or via WhatsApp. We used WA which allowed us to check the final order and bill before confirming it. \n\nWe love Kin Dee and I’m so happy to see the menu and physical restaurant expanding! A Mai Khao institution. 🥰",
                "The food quality is outstanding and prices are very affordable. A must visit. If you’re staying at JW Marriott a return taxi is 500 THB. Well worth it.\nStrongly recommend the pork belly. 👌🏼",
                "We've ended up eating here three times in the last week...as we keep coming back for more!\nThe food is great tasting and great value too across the extensive Thai menu.\nThe staff are very friendly and efficiently go about their work looking after customers.\nIt was raining one evening and one of the staff came across the road from the restaurant with an umbrella to help keep me dry, which was a kind thing to do!\nCouldn't recommend the place more highly...probably going back for a fourth visit before our vacation is over too!",
                "Very well executed Thai food, fresh and reasonably priced. Slightly away from the main hotel area, this is great local food at an affordable price. Many vegetable based dishes as well fish and meat. Banana blossom salad was my favourite of the evening.",
                "Came here with my family 3 nights in a row. Fresh , favorable and hot (temperature hot) food. Friendly folks, attentive service  and great food - highly recommend"
            ],
            "best_nearby_hotels": [
                "Avani+ Mai Khao Phuket Suites",
                "Anantara Mai Khao Phuket Villas",
                "Marriott's Mai Khao Beach - Phuket, A Marriott Vacation Club Resort",
                "Sai Kaew House"
            ],
            "best_nearby_restaurants": [
                "JJ's Bar & Food",
                "Zest Restaurant at Marriott Mai Khao Beach Resort",
                "Bill Bentley Pub At Turtle Village",
                "Aqua Pool Bar"
            ],
            "best_nearby_attractions": [
                "Soi Dog Foundation",
                "Mai Khao Beach",
                "Saphan Sarasin Bridge",
                "Splash Jungle Waterpark"
            ]
        },
        {
            "foodAndDrink_name": "Kopitiam by Wilai",
            "about_and_tags": [
                "Asian, Thai",
                "Vegetarian Friendly, Vegan Options, Gluten Free Options",
                "Lunch, Dinner, Brunch",
                "Takeout, Outdoor Seating, Seating, Highchairs Available, Serves Alcohol, Free Wifi, Table Service"
            ],
            "latitude": 7.884761,
            "longitude": 98.38791,
            "start_time": "11:00 AM",
            "end_time": "8:00 PM",
            "reviews": [
                "Outstanding service, delicious food and wonderful atmosphere ❤️. Very recommended from us. One of the best spot for lunch and dinner.",
                "One of our best meals. The food was very authentic, and the Thai iced tea was really great. Highly recommend trying this restaurant!",
                "The food here is excellent. I ordered a veggie meal with tofu. Usually I don’t line the  texture of tofu but this was cooked well. The price was excellent and the staff were really more and attentive. I would really recommend",
                "Great atmosphere with traditional look! \nHokkie noodles are basic dishes although those were the best I ever had! As well as Pak Ka Prao has a bit of chilli kick but tasted delicious. Really recommend to check this place out if you around told town.",
                "A great spot for lunch or dinner in old phuket town - very busy and therefore best to ring ahead and book a table. Sooo many options to choose from and all can be customised to your preference - including to be made vegetarian e.g. Tofu. \n\nWe are a family of 5 and ate here on our last day - saving the best till last! We all enjoyed our meal and thai tea / coffees! :)",
                "We had such a great lunch experience at this place. The historic elements & fact that this was family house converted into restaurant only adds to the overall authenticity of the restaurant, as if the great food was not enough. The food is a blend of Thai, Chinese Hokkien and Peranakan cuisine.\nWe enjoyed amazing massaman curry & pad thai, thai milk tea and blue butterfly pea ice tea. Regrettably, we did not try hokkien mee (noodles) which is their specialty.\nThe whole atmosphere & vibe is really great - it makes it a perfect pit stop on a hot day.\nThe staff is wonderful and super attentive.\nDon't miss it when you are in Old Phuket Town, it is truly a gem of a place.",
                "The food reflects a respect and an insistence of tradition, herbs, spices and long cooking time.   The waitresses were  also gracious and helpful.  \nThe drinks were also heartfully prepared, which is rare for a touristy district. \nFor us, this beats the Michelin Guide place we visited last night by a mile. \nTwo thumbs up for the combined experience of food, service, cleanliness, the entire experience and the value-for-money.",
                "We had the original noodle dish and i can taste the freshness of the ingredients but the flavor is nothing special as it’s a little mild for our taste.  The old phuket town where this restaurant is nice to check out and definitely worth the drive.",
                "The most amazing restaurant in Phuket town! We came here as many nights as we could and we’re only disappointed due to not realising they were shut on our final night - the Sunday night market night. Food was delicious and the staff were delightful!",
                "Situated in a very popular street in old Phuket town , great for old atmospheric ambience. Chinese dominated cuisine. Generous portions. Had char kuay tow , Pak mee Meng ( vegetarian) and local desert. \nFreshly prepared food , might have to wait as gets busy",
                "Lucky for us we happened on this delightful restaurant in the 1st week of our 6week stay on Phuket.We were staying in Surinbeach ( a good 45mins away)and visited at least 7/ 8 times..it was THAT good.\nNot only delicious local dishes..especially loved the Massaman and the crispy wintins with Salsa starter, but my favorite of all was the Lychee Mojito soda( only 65baht!!!)so beautiful and refreshing that often I had 2.\nThe staff are lovely, the history in the restaurant so intersting and the food delicious.The area is enchanting , very photogenic and well worth a visit.Highly recommend",
                "Great food for a very reasonable price. They have a large menu with plenty of good dishes and some very nice cold drinks. Staff were friendly as well, probably the nicest meal we had in Phuket.",
                "A Chinese-Thai restaurant in the heart of old Phuket on Thalang Road. The food here is amazing with delicious dishes I haven’t tasted elsewhere. The staff here are lovely and you can phone ahead and book a table. This is necessary as it is very popular.",
                "Food is good, try the Hockkien Mee. Service for after serving should improve. Takes too long. Also the ice coffee and black coffee is good.",
                "A very good restaurant . We had a dinner We had morning glory, pad met ma muang, Tom yam koong. Chicken Curri , Rice. Lichee drink.\nEvery dish was wonderful, delicious.\nWe will come again, the next time that we”ll be in the area."
            ],
            "best_nearby_hotels": [
                "Casa Blanca Boutique Hotel",
                "The Memory at On On Hotel",
                "The Neighbors Hostel",
                "Book a Bed Poshtel"
            ],
            "best_nearby_restaurants": [
                "Day & Night of Phuket",
                "Piset Restaurant Phuket",
                "Surf and Turf by Soul Kitchen",
                "The Neighbors Cafe"
            ],
            "best_nearby_attractions": [
                "Old Phuket Town",
                "The Library Phuket",
                "Endless Summer Phuket",
                "Phuket Thaihua Museum"
            ]
        },
        {
            "foodAndDrink_name": "Siam Deli",
            "about_and_tags": [
                "Serving gourmet sandwiches, pastries, light snacks to eat in or to go. Picnic menus, a mat and a blanket are available for your private picnic dining.",
                "International, Asian",
                "Vegetarian Friendly, Vegan Options, Gluten Free Options",
                "Breakfast, Lunch, Dinner, Brunch, Drinks",
                "Takeout, Outdoor Seating, Seating, Parking Available, Highchairs Available, Wheelchair Accessible, Serves Alcohol, Wine and Beer, Accepts Mastercard, Accepts Visa, Free Wifi, Accepts Discover, Accepts Credit Cards, Table Service, Waterfront, Family style"
            ],
            "latitude": 8.16599,
            "longitude": 98.2943,
            "start_time": "7:00 AM",
            "end_time": "10:00 PM",
            "reviews": [
                "Superb food . Indian food a must try chef Atul prepare the best Indian food in mai khao.dal fry and paneer tikka a must try .",
                "The food was amazing everyone was so friendly \nAnd special atul was amazing and the food was perfect and extremely friendly",
                "Great experience.\nMouthwatering food and special thanks to Mr. Atul Chef for the best preparation.\nLasuni Tikka, Dal Makhani, Kadhi Paneer, Pudina Paratha authentic taste after trying alk these",
                "Best tandoori and Indian restaurant. \nChef Atul’s attention to detail and commitment to using high-quality ingredients have made his tandoori offerings a standout at the resort",
                "Delicious, lip- smacking Indian cuisine made available by Chef Atul made our holiday even more memorable.Thank you Atul.",
                "Authentic Indian cuisine served by the finest chef Atul made the experience outstanding! Thanks Atul, we will visit again just for your warm hospitality",
                "Best indian food in phuket. Much better than anantara phuket. Chef Atul deserves a special mention coz he ensures that all your food requirements are met with during your stay even despite the same causing hardships to him. Thanks for providing special chole bhature in morning buffet chef Atul!",
                "Fantastic Indian meal at JWMarriot Phuket cooked by chef ATUL tandoori chicken and Australian lamb curry - served by beautiful staff BEER, JIB and LEK. thank you. Highly recommended. peter and melissa",
                "Great experience by Atul chef who was very friendly, helpful and made great food. Would definitely recommend this restaurant for all Indians especially.",
                "Food was very tasty !!!\nAtul chef was great and staff was very polite :)\nAmbience was also good.\nBoba drink was delicious.",
                "We went here and Chef Atul and his team were amazing and they met all of our requests and were very nice and accomodating truly amazing service from Chef Atul's team would try again.",
                "From service to dining, everything was beyond expected. Butter Chicken curry brought me back to the time I was in India. Phad See Ew was the best I’ve had in Thailand. Thanks to Chef Atul, Lek, Aum who leveled up our dining experience even further.",
                "The food at Siam Deli was delightful. Chef Atul, Chef Lekand Chef Bhuvan’s cooking was sooo delicious. The Butter Chicken was very authentic and super delicious. I hope to come here again.",
                "Butter chicken and garlic naan are two thumbs up! Chef Atul, Lek, Aum were so nice that they came to the table and checked our feedback. Fantastic and very authentic food. I tried some other western and thai food last few days and i liked all of them. Club sandwich, salads were all good! Will come back this week again.",
                "Great Tandoori chicken & Garlic Naan bread cooked by chef Atul. Very busy night had to call for more staff. \nWill be back on our next visit."
            ],
            "best_nearby_hotels": [
                "JW Marriott Phuket Resort & Spa",
                "Avani+ Mai Khao Phuket Suites",
                "Anantara Mai Khao Phuket Villas",
                "Anantara Vacation Club Mai Khao Phuket"
            ],
            "best_nearby_restaurants": [
                "Rim Nam Pool Bar",
                "Taurus Restaurant",
                "JW Café",
                "Sea Fire Salt - Anantara Mai Khao Phuket Villas"
            ],
            "best_nearby_attractions": [
                "Mai Khao Beach",
                "Soi Dog Foundation",
                "Saphan Sarasin Bridge",
                "Splash Jungle Waterpark"
            ]
        },
        {
            "foodAndDrink_name": "Eightfold Restaurant",
            "about_and_tags": [
                ""
            ],
            "latitude": 7.821076,
            "longitude": 98.29978,
            "start_time": "1:00 PM",
            "end_time": "10:00 PM",
            "reviews": [
                "This restaurant is a gem. The staff are typically Thai, friendly, helpful and with the traditional smile.\n\nThe food is clearly cooked with care. It looks fresh and tastes fresh. The staff listen to what you want, a bit more or less. \n\nLooked great, tasted...\n                     \n                      great. \n\nSearch this place out……10 minute walk from the beach.\n                     \n\n                      More",
                "Lovely spot for dinner!\n\nWe stayed in Kata beach for 5 nights and ate at Eightfold twice. Really lovely food and atmosphere, quiet and relaxing.\n\nI am also coeliac and have struggled with finding gluten free options but it was great here. Plenty of options...\n                     \n                      and great food and great prices.\n                     \n\n                      More",
                "The worst restaurant don’t go there. The food was bad looks like leftovers from couple days . Don’t waste your money or eat there no good at all",
                "I'm coeliac and ate at Eightfold four times and had take-away once during my stay at Kata Beach. The staff are very knowledgeable about gluten free and were able to advise me on which dishes were safe, they took my order and repeated it back...\n                     \n                      to me to clarify it was GF. It was a relief to be able to feel safe while still being able to eat traditional dishes, the prawn Pad Thai was a favourite. Both my non-gluten free partner and I found the food delicious, the staff lovely and the cafe delightful and would recommend Eightfold.\n                     \n\n                      More",
                "Delicious food !!! Very friendly & very polite  staff. Our favourite dishes: Chicken satay & Penang chicken curry 😋😋😋 You won’t be disappointed!",
                "Consistently good, long established family run restaurant.    Great Thai food and Western also.   Pizzas are especially good.",
                "I’m a meat eater but i fancied trying tofu so I ordered Penang with tofu and vegetables and it was very spicy but absolutely beautiful! One of the nicest curries I’ve had - the noodles were also fantastic and the spring rolls.\nwould definitely return...\n                     \n                      if I was here again\n                     \n\n                      More",
                "Very good! Spicy food is actually spicy here!\nFeels like it is family-run and the english level is way better than rest of Thailand!",
                "If you want to try Thai food that is a step up from the usual fare (as good as that is), Eightfold is a must. Our dishes were a cut above the offerings at other Thai restaurants in the area, with the chilli basil being...\n                     \n                      especially good.\n                     \n\n                      More",
                "Following a recommendation that this was a coeliac friendly restaurant we had to give it a go. With a leafy facade it feels fresh just walking in. I had Vegetable Panang which was amazing. My wife had vegetable pad thai and put son a chicken...\n                     \n                      burger and chips (of course!) Service was friendly, it seemed to be family run and for us to all eat and have soft drinks it cost about £12, fantastic!\n                     \n\n                      More",
                "Eaten here 3 times in the last 3 weeks, everything cooked so well, the service is always good, the staff are very attentive, if you have room for dessert, recommend the honey toast with ice cream.",
                "I absolutely LOVED Eightfold Restaurant!! I was looking for healthy, fresh, authentic Thai food with no MSG. Not always easy to find! I lucked into a table before the dinner rush (before 6pm I guess?). The staff were all very friendly & polite especially the...\n                     \n                      manager/owner(?) who was seating people. (His English was excellent too which was a treat.) I ordered Papaya Salad & Tom Kha vegetarian soup (coconut broth). I asked for it SPICY & it was AMAZING! I’m a very white, gray haired 53yr old Canadian woman & I can never convince people I actually want my food so spicy my eyeballs sweat! This was fresh cooked & exactly what I wanted! (Those of u who don’t like spice, don’t worry, they will make your food how u want it.) As I was eating my dinner, many people came to get a table here & the owner-manager was very gracious & helpful (& patient with all the tourists) as he gave them a number & approximate time to come back. Also note the bathroom was very clean & pretty. And my chocolate gelato was delicious & cooling! All around just a super experience for 400baht - awesome!! I think I’ll go back again before I leave Kata Beach❤️\n                     \n\n                      More",
                "This is a hidden gem. We found this on our second last night and wish we found ot sooner. Everything we ordered was fantastic. The best pizza we have tasted EVER!",
                "My fiance and I came here two nights on the run and this is absolutely the best Thai food we have ever ate!!! We had the tempura vegetables, crispy pork special, chicken red curry & prawn green curry - it was all incredible. We are...\n                     \n                      especially gutted to be leaving Phuket because we’ve loved this food so much haha! It’s also a lovely little restaurant on a cute street, & those who work in the restaurant are all very kind and welcoming. ❤️\n                     \n\n                      More",
                "Wonderful restaurant with delicious food. Best Panang I've had. Friendly staff. 10/10 ! Very reasonably priced Thank you"
            ],
            "best_nearby_hotels": [],
            "best_nearby_restaurants": [],
            "best_nearby_attractions": []
        },
        {
            "foodAndDrink_name": "Phuketique Coffee Bar",
            "about_and_tags": [
                "",
                "Cafe",
                "Vegetarian Friendly",
                "Lunch, Brunch, Breakfast"
            ],
            "latitude": 7.883316,
            "longitude": 98.38724,
            "start_time": "9:00 AM",
            "end_time": "11:30 PM",
            "reviews": [
                "When spending time in Old Phuket Town we decided to have a bite to eat mid morning at Phuketque.\nWe had read somewhere about a dish they do which sounded interesting so we ordered it.\nBasically it is like a very thick toast bread  soaked...\n                     \n                      in caramel and butter then fried , then a dob of Madagascar Icecream was put on top.\nDifferent, it was very moreish, delicious, could have eaten another straight away.\nOnly a small place, restricted seating and quite popular.\nGive it a try .\n                     \n\n                      More",
                "A little gem of a find! Great menu, great coffee, great homemade lemonade. Great iced tea and iced coffee. Literally sat here watching the world in old town Phuket go by.\nJust the prices are bit High rest it's a great place to hangout,chill and...\n                     \n                      relax.\n                     \n\n                      More",
                "All staffs are unfriendly and ignorant to the customers. Don't see any smile from them at all and they keep chit chating with each other. The toast quality is also overrated. It's simply the toast with sugar and butter and nothing spectacular. Never return again",
                "they advertise Nutella and banana on the menu and turn around in true slight of hand style they substitute the knock off Ovaltine spread.   the toast is nothing special and it is just to busy for my liking.",
                "An accidental chance-upon and we loved it! If you fancy After You’s desserts, you have to try Phuketique’s and you probably will love it like we do :) May seem impossible to get a seat given the small area but the crowd moves relatively quickly.",
                "Once visit the Old town. This is the little cafe but good quality of french toats so yummy!!!\nAnd awesome location in the corner of street.",
                "We were exploring old Phuket when we stumbled across this gem! There are queues of up to 30 mins for people waiting for their house speciality, the Burnt Butter Toast.\n\nA must try if you are in the area! The staff are lovely as well...\n                     \n                      despite the queues!\n                     \n\n                      More",
                "I think it is a Phuket landmark. It is the best french toast ever I would go back there just for the french toast. High quality ingredients. You should wait in a queue for this amazing french toast",
                "The place is too small to even see two people without a long wait. This fact they only tell you after you have paid.\n\nTo add insult to the whole experience the cashier said we could not have their top-selling toast because they were out...\n                     \n                      of their sugar honeycomb. Well, as the photo shows, they had boxes of the stuff on the prep counter.\n\nThe desserts were overall quite average. Which we had to enjoy on a rainy afternoon on the sidewalk. I’ll blah experience overall.\n                     \n\n                      More",
                "Honey Toast is just perfect, you must try. High recommend for all honey toast menus . Coffee also good. Place was so small, may be just grab and go coz always packed",
                "It's a small cafe in Phuket town with the best french toast I had in my life! it's really amazing everyone in Phuket should try it!",
                "The ice cream with bread is a real treat, melting and tasty we share with friends as it was quite a big portion, place near the street and small but fine",
                "Can't say enough good things about this place. The food is consistently excellent and made with real love. The beer selection is awesome and they come with the finest beer snacks in existence. To top it all off the owner and staff are absolutely lovely....\n                     \n                      Big love!\n                     \n\n                      More",
                "What an awesome find. This funky little coffee/craft beer shop was really cute and full of rustic ambiance. Staff were very friendly , service was great. Beer cold and reasonably priced.",
                "One of my favorite places places in Phuket. A cozy little corner shop/bar with good selection of drinks and the awesome Burnt Butter Toast. Owner is very nice and welcoming and it's a great place to sit and watch the life in old town and...\n                     \n                      enjoy.\n                     \n\n                      More"
            ],
            "best_nearby_hotels": [],
            "best_nearby_restaurants": [],
            "best_nearby_attractions": []
        }
    ];

    const attractions = ["Kata Noi Beach", "Big Buddha Phuket", "Art Space Gallery and Music Bar", "Pashtoosh Art Gallery"];
    const hotels = ["Chanalai Garden Resort", "The Boathouse Phuket", "Kata Rocks", "Mom Tri's Villa Royale"];

    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);


    return (
        <Box sx={{ height: '100vh', backgroundColor: '#f0f0f0', width: '100vw', display: "flex" }}>
            <CssBaseline />
            <Grid container>
                <Grid item xs={8}>
                    <Chat messages={messages} setMessages={setMessages} />
                </Grid>
                <Grid item xs={4}>
                    <Suggestion
                        foodAndDrinks={foodAndDrinks}
                        attractions={attractions}
                        hotels={hotels}
                    />
                </Grid>
            </Grid>

        </Box>
    );
};

export default App;
