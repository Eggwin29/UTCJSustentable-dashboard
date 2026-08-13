import { Card } from "@/components/ui/card";

interface ComponentSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export default function ComponentSection({
    title,
    description,
    children,
}: ComponentSectionProps) {
    return (
        <Card variant="outlined">
            <Card.Header>
                <Card.Title>
                    {title}
                </Card.Title>

                {description && (
                    <Card.Description>
                        {description}
                    </Card.Description>
                )}
            </Card.Header>

            <Card.Body>
                {children}
            </Card.Body>
        </Card>
    );
}