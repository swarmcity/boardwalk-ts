# Boardwalk Roadmap

## How to use this document

Every Episode is a development sprint. Each Episode consists of a set of Epics devs must work through in order to create the functionalities highlighted in the Episode.

After each sprint the dev team will show a functioning DApp demo in which the scenario described by the Episode is played out.

Once an Episode is completed, devs are free to move on to the ensuing Episode.

## Glossary

Check out these articles to learn more about the general concepts of Swarm City.

- [Marketplaces](https://press.swarm.city/hashtags-revisited-694a7c9ff7a4)
- [Storefronts](https://press.swarm.city/storefront-15f4c2a28d6f)
- [Reputation](https://press.swarm.city/blockchain-reputation-promoting-good-actors-in-a-free-society-8f6117069cde)
- [Hives](https://press.swarm.city/hives-f4845639eccf)
- [Overview](https://thisis.swarm.city/)

## Supporting documentation

[Mobile Sketch Clickthrough](https://www.sketch.com/s/3f60e3a1-b49d-4486-9ac5-6474386697ac)

[Desktop Sketch Clichthrough](https://www.sketch.com/s/9fcd9b69-467b-48b8-8b2c-7975fd5b4224)

---

# Season 0 (Pilot)

## S00 E01: All beginnings are hard

In Episode 1 of the pilot-season: Terminal is born!

[Terminal Repo](https://github.com/swarmcity/terminal-)

- [ ] Completed

# Season 1

## S01 E01: First Request

In Episode 1, Frank is really excited to start using Swarm City. Whenever he gets excited by something, Frank throws himself whole hog into it. And so without delay he creates and posts his first request.

Frank would like someone to translate his "Decentralise Now!" manifesto in exchange for 33 DAI. He posts this request in the marketplace known as "Settler", because "Settler" is a place where early adopters go to do such things.

Frank is on /new-request, filling in the description: "Translate my 1 page manifesto from English to Dutch." and the amount: "33 DAI".

After submitting his request, he sees it on page /marketplace (of Settler). Frank taps on his item to see the detail.

Who, oh who, will respond to Frank's request?

#### New epics in this episode:

- [ ] Epic 1: As a user, I can see all marketplaces with the number of completed deals for each one, so I can see the activity in Swarm City. [Issue #6](https://github.com/swarmcity/boardwalk-ts/issues/6)

- [ ] Epic 2: As a Seeker, I can post a new request in a marketplace, describing what I am asking for and how much DAI I am offering, so providers can see what my need is. [Issue #1](https://github.com/swarmcity/boardwalk-ts/issues/1)

- [ ] Epic 3: As a user, I can see all the items in a marketplace, so I know my activity, and activity of other people. [Issue #2](https://github.com/swarmcity/boardwalk-ts/issues/2)

- [ ] Epic 4: As a user, I see the detail-view of a request/deal I’m active in so I can verify all the details of this request/deal. [Issue #3](https://github.com/swarmcity/boardwalk-ts/issues/3)

## S01 E02: Request Replies

In Episode 2, two people reply to Frank's request.

Ellis sees Frank's request and taps it. Here Ellis can see the details of the request, and she decides to reply.

Tom is hanging out in Swarm City in the Settler Marketplace, and he also sees Frank's request. He's intrigued, so he taps it to see the details. Tom decides to reply as well.

Frank sees the two replies. Who will he choose?

#### New epics in this episode:

- [ ] Epic 1: As a Provider I can reply to a request, so I can express my interest in entering into the deal. [Issue #4](https://github.com/swarmcity/boardwalk-ts/issues/4)

- [ ] Epic 2: As a user I can see replies to a request. [Issue #5](https://github.com/swarmcity/boardwalk-ts/issues/5)

## S01 E03: The Burden of Choice

In Episode 3, Frank has to decide who he wants to choose as a provider for his request.

Frank gets to know the reputation of the repliers, Ellis and Tom. Alice's reputation is sketchy, so he chooses Tom to become the provider.

Tom is very happy, and agrees to the deal.

Will they successfully complete this deal, or is there a conflict waiting around the corner?

#### New epics in this episode:

- [ ] Epic 1: As a user, I see another user’s reputation so I can interpret it to decide how trustworthy the other user is. [Issue #7](https://github.com/swarmcity/boardwalk-ts/issues/7)

- [ ] Epic 2: As a Seeker, I choose one of the Repliers to become my Provider so we can enter into a deal. [Issue #8](https://github.com/swarmcity/boardwalk-ts/issues/8)

- [ ] Epic 3: As a Provider, I accept and fund the deal, so the Seeker and I are engaged in a deal. [Issue #9](https://github.com/swarmcity/boardwalk-ts/issues/9)

## S01 E04: The Successful Deal

In Episode 4, Frank and Tom successfully complete their deal.

When a deal is successfully completed both users gain reputation. Frank can view his new reputation, while Tom verifies that he received his paymnet.

Tom is very excited he got paid because he knows it opens up a whole new world of possibilities. What will he do with his newly gained capital?

#### New epics in this episode:

- [ ] Epic 1: As a Seeker, I payout the deal so the provider gets their funds, and reputation tokens are created for me and the provider. [Issue #10](https://github.com/swarmcity/boardwalk-ts/issues/10)

- [ ] Epic 2: As a user, I can see my reputation in each marketplace, so I can get a sense of how other users might perceive me. [Issue #11](https://github.com/swarmcity/boardwalk-ts/issues/11)

## S01 E05: Going Sour

In Episode 5 Tom tries to make up his mind about where to post his first request. He needs translation services in a language he doesn't speak, but there are so many possibilities to choose from!

In order to decide, Tom checks out the information display for several different marketplaces.

He chooses the #Frontier marketplace and posts a new request. After perusing the responses Tom selects Brenda as a provider, which results in a deal between them.

Although Brenda agreed to the deal, she never delivers. Tom wonders where she is so he sends her a chat message in their shared deal.

Brenda replies "Damn, it's just too hard for me, Ton! You want it in what langwage?", which of course makes Tom seriously ticked off. Had he known Brenda couldn't spell and wouldn't deliver he never would have selected her. Unfortunately Tom has to resort to his last option: initiating conflict resolution with the Marketplace Maintainer. Will Tom get justice?

#### New epics in this episode:

- [ ] As a user I can find the details for a marketplace, so I can learn more about it. [Issue #35](https://github.com/swarmcity/boardwalk-ts/issues/35)

- [ ] As a user, I can chat so I can communicate about the deal. [Issue #36](https://github.com/swarmcity/boardwalk-ts/issues/36)

- [ ] As a user I can start a conflict about the deal, so I can express I do not agree to the deal anymore. [Issue #37](https://github.com/swarmcity/boardwalk-ts/issues/37)

## S01 E06: Finding Peace

In Episode 6 we meet Crystal, the Marketplace Maintainer. She is responsible for resolving the conflict between Tom and Brenda.

Crystal checks the details of their deal. She theb joins the chat with Tom and Brenda, and starts communicating with them. She evaluates both sides of the argument.

Crystal resolves the conflict in favor of Tom. Brenda realizes it was her own fault for taking on a job she couldn't handle. (For one thing, spelling your customer's name right is important!) Will she do a better job next time?

#### New epics in this episode:

- [ ] As a Marktplace Maintainer I can resolve conflicts, so users have a fair marketplace. [Issue 43](https://github.com/swarmcity/boardwalk-ts/issues/43)

## S01 E07: Searching New Horizons

In Episode 7, Brenda tries to reply to a request on a different marketplace.

Brenda sees the marketplacelist and chooses a different marketplace she's interested in. This time she filters the list to only see requests nearby, because she believes she'll have a better chance of fulfilling requests that occur in her general neighborhood.

Brenda sees Gary's request. It's nearby, and it's the amount she's looking for, so she responds to Gary's request. Gary picks Brenda as the provider, but by that time Brenda is passed out on the couch.

Gary loses his patience with Brenda, so he deselects her and picks someone else.

#### New epics in this episode:

- [ ] As Seeker, I can deselect the Provider I previously selected, so I can choose another one. [Issue 45](https://github.com/swarmcity/boardwalk-ts/issues/45)

- [ ] As a user, I can filter a marketplaces’s items by my geo-range of choice so I can see items in my area.

## S01 E08: Bad Luck Gary

In Episode 8, Gary has no luck with his deal, so he just gives up.

After deselecting Brenda, Gary selects Pepe as a Provider. Unfortunately, Pepe declines which leaves Gary's deal without a Provider. This makes Gary totally fed up, cancelling his deal. Will Gary ever particpate again?

#### New epics in this episode:

- [ ] As a Provider, I decline a Seeker's selection of me, so I can express I'm no longer interested in fullfilling the request.

- [ ] As a Seeker, I can cancel my request, so the request is no longer on the marketplace.

- [ ] As a user, I get notified so I can quickly navigate to the actionnable items.
