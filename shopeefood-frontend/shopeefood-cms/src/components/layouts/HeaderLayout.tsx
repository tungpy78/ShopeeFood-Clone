import { LoginOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Image, type MenuProps } from "antd"
import type { HeaderLayoutProps } from "../../types/layout.type";
import logo from "../../assets/logo.png";

function HeaderLayout({ collapsed, setCollapsed }: HeaderLayoutProps){
    const items: MenuProps['items'] = [
    {
        key: '1',
        label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
            <SettingOutlined />  Setting
        </a>
        ),
    },
    {
        key: '2',
        label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
            <LoginOutlined />  Logout
        </a>
        ),
    }
    ];
    return(
        <>  
            <div className="flex justify-between items-center w-full">
                <div className="flex justify-center items-center">
                    <div>
                        <Image 
                        src={logo}
                        width={64}
                        />
                    </div>
                    <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                    }}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Badge count={5}>
                    🔔
                    </Badge>
                    <Dropdown menu={{ items }}  placement="bottom" arrow={{ pointAtCenter: true }}>
                        <Avatar>U</Avatar>
                    </Dropdown>
                </div>
            </div>
        </>
    )
}
export default HeaderLayout