import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

export default function ChannelNode({
  data,
}: {
  data: { onExplore: (channelData: any) => void };
}) {
  const [channelData, setChannelData] = useState({
    theme: "",
    description: "",
    url: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelData({ ...channelData, [e.target.name]: e.target.value });
  };

  const handleExplore = (e: React.FormEvent) => {
    e.preventDefault();
    data.onExplore(channelData);
  };

  return (
    <Card className="w-96">
      <CardHeader className="flex justify-center items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={60}
          className="object-contain"
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paste">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Enter Details</TabsTrigger>
            <TabsTrigger value="paste">Paste Link</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <form onSubmit={handleExplore} className="space-y-4">
              <Input
                name="theme"
                placeholder="Channel Theme"
                value={channelData.theme}
                onChange={handleInputChange}
              />
              <Input
                name="description"
                placeholder="Brief Description"
                value={channelData.description}
                onChange={handleInputChange}
              />
              <Button type="submit" className="w-full mt-[60px] h-[64px]">
                Explore Ideas
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="paste">
            <form onSubmit={handleExplore} className="space-y-4">
              <Input
                name="url"
                placeholder="Paste channel URL"
                value={channelData.url}
                onChange={handleInputChange}
              />
              <Button type="submit" className="w-full mt-[30px] h-[64px]">
                Explore Ideas
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
