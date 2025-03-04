import { useState, useRef, ReactNode } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { dropdownAnimation } from '../../../utils/others/FramerMotionAnimations';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { MenuContainer, Menu, MenuItem, Icon } from './DropdownMenu2.styles';

// Interface for React functional components
interface DropdownMenuPropsIF {
    title: string;
    children: ReactNode;
    marginTop?: string;
    titleWidth?: string;
    logo?: string;
    left?: string;
    right?: string;
}

export default function DropdownMenu2(props: DropdownMenuPropsIF) {
    const { title, children, marginTop, titleWidth, logo, left, right } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dropdownRefItem = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const clickOutsideHandler = () => setIsMenuOpen(false);

    UseOnClickOutside(dropdownRefItem, clickOutsideHandler);

    const dropdownMenuContent = (
        <MenuContainer
            onClick={() => setIsMenuOpen(false)}
            variants={dropdownAnimation}
            initial='hidden'
            animate='show'
            exit='hidden'
            style={{
                top: marginTop ? marginTop : '30px',
                left: left,
                right: right,
            }}
        >
            {children}
        </MenuContainer>
    );

    const desktopScreen = useMediaQuery('(min-width: 1020px)');

    return (
        <div ref={dropdownRefItem}>
            <Menu
                alignItems='center'
                color='text1'
                gap={4}
                justifyContent='center'
                fullWidth
                onClick={toggleMenu}
                style={{
                    minWidth: !desktopScreen
                        ? ''
                        : titleWidth
                        ? titleWidth
                        : '100px',
                }}
            >
                <MenuItem gap={4}>
                    {desktopScreen && (
                        <Icon justifyContent='center' alignItems='center'>
                            <img
                                src={logo}
                                alt={title}
                                width={title === 'Scroll' ? '20px' : '15px'}
                                height='20px'
                                style={{
                                    borderRadius: '50%',
                                    marginLeft: '2px',
                                }}
                            />
                            {title === 'Scroll Sepolia' ? 'Sepolia' : title}
                        </Icon>
                    )}
                    {!desktopScreen && (
                        <img
                            src={logo}
                            alt={title}
                            width='18px'
                            height='18px'
                            style={{ borderRadius: '50%', marginLeft: '2px' }}
                        />
                    )}
                </MenuItem>
                <FaAngleDown style={{ marginLeft: '4px', marginTop: '2px' }} />
            </Menu>
            {isMenuOpen && dropdownMenuContent}
        </div>
    );
}
