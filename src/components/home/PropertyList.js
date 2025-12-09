import styled from 'styled-components';
import PropertyCard from '../property/PropertyCard';
import { properties } from '../../data/properties';

const Section = styled.section`
  padding: 4rem 2rem;
  background: #f5f5f5;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

function PropertyList() {
  return (
    <Section>
      <Container>
        <Title>Featured Properties</Title>
        <Grid>
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

export default PropertyList; 