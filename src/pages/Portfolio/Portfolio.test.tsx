import { render, screen } from '@testing-library/react';

import Portfolio from './Portfolio';

test.skip('renders Trade() React function instance', () => {
    render(<Portfolio />);
    const portfolioElement = screen.getByTestId('portfolio');
    expect(portfolioElement).toBeInTheDocument();
});
