import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../src/components/Layout';
import Header from '../src/components/Header';

// Helper function to render with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Layout and Navigation', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders header with correct elements', () => {
    renderWithRouter(<Header />);
    
    // Check company name
    expect(screen.getByText('Kincaid Wolstein')).toBeInTheDocument();
    
    // Check navigation links
    expect(screen.getByRole('link', { name: 'Evaluees' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New Evaluee' })).toBeInTheDocument();
  });

  it('renders layout with child content', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('maintains header visibility with scrolling content', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div style={{ height: '2000px' }}>Tall Content</div>
      </Layout>
    );

    expect(screen.getByText('Kincaid Wolstein')).toBeVisible();
    
    // Simulate scroll
    container.scrollTop = 1000;
    expect(screen.getByText('Kincaid Wolstein')).toBeVisible();
  });

  it('applies correct styles to layout elements', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // Check main content area styles
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveStyle({
      paddingTop: '24px',
      paddingBottom: '24px'
    });
  });

  it('handles navigation clicks', async () => {
    renderWithRouter(<Header />);
    
    const user = userEvent.setup();
    
    // Click evaluees link
    await user.click(screen.getByRole('link', { name: 'Evaluees' }));
    expect(window.location.pathname).toBe('/evaluees');

    // Click new evaluee link
    await user.click(screen.getByRole('link', { name: 'New Evaluee' }));
    expect(window.location.pathname).toBe('/evaluees/new');

    // Click home link (company name)
    await user.click(screen.getByText('Kincaid Wolstein'));
    expect(window.location.pathname).toBe('/');
  });

  it('renders header with correct styling', () => {
    renderWithRouter(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('MuiAppBar-root');
    expect(header).toHaveClass('MuiAppBar-colorDefault');
  });

  it('renders navigation buttons with correct styling', () => {
    renderWithRouter(<Header />);
    
    const evalueesButton = screen.getByRole('link', { name: 'Evaluees' });
    expect(evalueesButton).toHaveClass('MuiButton-root');
    expect(evalueesButton).toHaveClass('MuiButton-colorInherit');

    const newEvalueeButton = screen.getByRole('link', { name: 'New Evaluee' });
    expect(newEvalueeButton).toHaveClass('MuiButton-root');
    expect(newEvalueeButton).toHaveClass('MuiButton-colorPrimary');
    expect(newEvalueeButton).toHaveClass('MuiButton-contained');
  });

  it('maintains layout structure with different content sizes', () => {
    // Test with small content
    const { rerender } = renderWithRouter(
      <Layout>
        <div>Small Content</div>
      </Layout>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Test with large content
    rerender(
      <BrowserRouter>
        <Layout>
          <div style={{ height: '2000px' }}>Large Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});