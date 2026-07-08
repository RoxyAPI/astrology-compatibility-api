import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);

/**
 * Astrology Compatibility API: scores two birth charts through Western synastry aspects and
 * returns an overall percent, five category scores, sign pair narratives, and a relationship
 * archetype. Roxy Ephemeris, verified against NASA JPL Horizons.
 * Call /location/search for each person first -- never hardcode coordinates.
 */
async function main() {
  // Step 1: geocode person 1 birth city
  const { data: loc1, error: locErr1 } = await roxy.location.searchCities({
    query: { q: 'New York' },
  });
  if (locErr1) throw new Error(locErr1.error);
  const { latitude: lat1, longitude: lng1, timezone: tz1 } = loc1.cities[0];

  // Step 2: geocode person 2 birth city
  const { data: loc2, error: locErr2 } = await roxy.location.searchCities({
    query: { q: 'Los Angeles' },
  });
  if (locErr2) throw new Error(locErr2.error);
  const { latitude: lat2, longitude: lng2, timezone: tz2 } = loc2.cities[0];

  // Step 3: score the astrology compatibility between the two charts
  const { data, error } = await roxy.astrology.calculateCompatibility({
    body: {
      person1: {
        date: '1990-07-15',
        time: '14:30:00',
        latitude: lat1,
        longitude: lng1,
        timezone: tz1,
      },
      person2: {
        date: '1992-03-20',
        time: '09:15:00',
        latitude: lat2,
        longitude: lng2,
        timezone: tz2,
      },
    },
  });

  if (error) throw new Error(error.error);

  console.log('Overall compatibility score:', data.overallScore);
  console.log('Archetype:', data.archetype.label);

  console.log('\nCategory scores:');
  for (const [name, score] of Object.entries(data.categories)) {
    console.log(`  ${name}: ${score}`);
  }

  console.log(
    `\nAspect breakdown: ${data.aspectBreakdown.total} total ` +
      `(${data.aspectBreakdown.harmonious} harmonious, ${data.aspectBreakdown.challenging} challenging)`
  );

  console.log('\nTop 3 key aspects:');
  for (const aspect of data.keyAspects.slice(0, 3)) {
    console.log(
      `  ${aspect.planet1} ${aspect.type} ${aspect.planet2} orb ${aspect.orb} [${aspect.interpretation}]`
    );
  }

  console.log('\nSummary:', data.summary);
}

main().catch(console.error);
